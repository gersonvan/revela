import pg from "pg";
import sharp from "sharp";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/eventoon";

const client = new pg.Client({ connectionString });

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function uploadSmokePhoto(message) {
  const imageBuffer = await sharp({
    create: {
      background: "#D4562B",
      channels: 3,
      height: 64,
      width: 64,
    },
  })
    .png()
    .toBuffer();

  const formData = new FormData();
  formData.append("guestName", "Smoke Moderacao");
  formData.append("message_0", message);
  formData.append(
    "photos",
    new Blob([imageBuffer], { type: "image/png" }),
    `${message}.png`,
  );

  const response = await fetch(`${baseUrl}/api/events/evento-demo/photos`, {
    body: formData,
    method: "POST",
  });
  const payload = await response.json();

  assertOk(
    response.ok,
    `Upload failed: ${response.status} ${JSON.stringify(payload)}`,
  );
  assertOk(payload.uploaded === 1, "Expected exactly one uploaded photo");
  return payload.photoIds[0];
}

async function findPhoto(photoId) {
  const result = await client.query(
    `
      SELECT "id", "status"
      FROM "Photo"
      WHERE "id" = $1
      LIMIT 1
    `,
    [photoId],
  );

  return result.rows[0];
}

await client.connect();

await client.query(
  `UPDATE "Event" SET "moderationMode" = 'WITH_MODERATION' WHERE "publicSlug" = 'evento-demo'`,
);
const pendingPhotoId = await uploadSmokePhoto(`with-mode-${Date.now()}`);
const pendingPhoto = await findPhoto(pendingPhotoId);
assertOk(pendingPhoto?.status === "PENDING", "WITH_MODERATION should create PENDING photos");

await client.query(
  `UPDATE "Event" SET "moderationMode" = 'WITHOUT_MODERATION' WHERE "publicSlug" = 'evento-demo'`,
);
const approvedPhotoId = await uploadSmokePhoto(`without-mode-${Date.now()}`);
const approvedPhoto = await findPhoto(approvedPhotoId);
assertOk(
  approvedPhoto?.status === "APPROVED",
  "WITHOUT_MODERATION should create APPROVED photos",
);

const decisionResult = await client.query(
  `
    SELECT "action", "moderatorId", "previousStatus", "newStatus"
    FROM "ModerationDecision"
    WHERE "photoId" = $1
    ORDER BY "createdAt" DESC
    LIMIT 1
  `,
  [approvedPhotoId],
);
const decision = decisionResult.rows[0];
assertOk(decision, "Expected an automatic moderation decision");
assertOk(decision.action === "AUTO_APPROVED", "Expected AUTO_APPROVED decision");
assertOk(decision.moderatorId === null, "AUTO_APPROVED decision should not have a moderator");
assertOk(decision.previousStatus === "PENDING", "Expected previous status PENDING");
assertOk(decision.newStatus === "APPROVED", "Expected new status APPROVED");

const approvedResponse = await fetch(
  `${baseUrl}/api/events/evento-demo/approved-photos`,
);
const approvedPayload = await approvedResponse.json();
assertOk(
  approvedResponse.ok,
  `Approved photos endpoint failed: ${approvedResponse.status}`,
);
assertOk(
  approvedPayload.photos.some((photo) => photo.id === approvedPhotoId),
  "Auto-approved photo was not returned by screen feed endpoint",
);

await client.end();

console.log("Moderation mode smoke OK");
console.log(`- Pending photo: ${pendingPhotoId}`);
console.log(`- Auto-approved photo: ${approvedPhotoId}`);
