import pg from "pg";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/eventoon";
const inviteToken = process.env.MODERATOR_APP_INVITE_TOKEN ?? "moderador-demo-token";
const deviceId = `smoke-device-${Date.now()}`;

const client = new pg.Client({ connectionString });

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { payload, response };
}

await client.connect();
await client.query(
  `UPDATE "Moderator" SET "status" = 'CREATED', "deviceId" = NULL, "activatedAt" = NULL, "revokedAt" = NULL WHERE "id" = 'moderator_demo'`,
);
const photoId = `photo_app_smoke_${Date.now()}`;
await client.query(
  `
    INSERT INTO "Photo" (
      "id",
      "eventId",
      "guestName",
      "originalFileUrl",
      "mimeType",
      "sizeBytes",
      "status",
      "uploadedAt",
      "updatedAt"
    )
    VALUES ($1, 'event_demo', 'Smoke App', '/media/smoke-app.png', 'image/png', 10, 'PENDING', NOW(), NOW())
  `,
  [photoId],
);

const activation = await requestJson("/api/moderator-app/sessions", {
  body: JSON.stringify({
    appVersion: "smoke",
    deviceId,
    deviceName: "Smoke Device",
    inviteToken,
    platform: "ios",
  }),
  method: "POST",
});
assertOk(
  activation.response.status === 201,
  `Expected activation 201, got ${activation.response.status}`,
);
const sessionToken = activation.payload.sessionToken;
assertOk(sessionToken, "Expected session token");

const authHeaders = { authorization: `Bearer ${sessionToken}` };
const me = await requestJson("/api/moderator-app/me", { headers: authHeaders });
assertOk(me.response.ok, `Expected /me OK, got ${me.response.status}`);
assertOk(me.payload.event.publicSlug === "evento-demo", "Expected demo event scope");

const photos = await requestJson("/api/moderator-app/photos?status=PENDING", {
  headers: authHeaders,
});
assertOk(photos.response.ok, `Expected photos OK, got ${photos.response.status}`);
assertOk(
  photos.payload.items.some((photo) => photo.id === photoId),
  "Expected seeded pending photo in app list",
);

const detail = await requestJson(`/api/moderator-app/photos/${photoId}`, {
  headers: authHeaders,
});
assertOk(detail.response.ok, `Expected detail OK, got ${detail.response.status}`);
assertOk(detail.payload.id === photoId, "Expected event-scoped photo detail");

const decision = await requestJson(
  `/api/moderator-app/photos/${photoId}/decision`,
  {
    body: JSON.stringify({ nextStatus: "APPROVED" }),
    headers: authHeaders,
    method: "POST",
  },
);
assertOk(
  decision.response.ok,
  `Expected decision OK, got ${decision.response.status}`,
);
assertOk(decision.payload.newStatus === "APPROVED", "Expected approved decision");

await requestJson("/api/moderator-app/push-token", {
  body: JSON.stringify({
    appVersion: "smoke",
    platform: "ios",
    pushToken: "ExponentPushToken[smoke]",
  }),
  headers: authHeaders,
  method: "PUT",
}).then(({ response }) => {
  assertOk(response.status === 204, `Expected push token 204, got ${response.status}`);
});

await requestJson("/api/moderator-app/sessions/current", {
  headers: authHeaders,
  method: "DELETE",
}).then(({ response }) => {
  assertOk(response.status === 204, `Expected logout 204, got ${response.status}`);
});

await client.end();

console.log("Moderator app API smoke OK");
