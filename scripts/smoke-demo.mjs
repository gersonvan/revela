import pg from "pg";
import sharp from "sharp";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/eventoon";
const client = new pg.Client({ connectionString });

async function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertHttpOk(url) {
  const response = await fetch(url, { method: "HEAD" });
  await assertOk(response.ok, `Expected ${url} to return 2xx, got ${response.status}`);
}

await client.connect();

await assertHttpOk(`${baseUrl}/e/evento-demo`);
await assertHttpOk(`${baseUrl}/moderate/moderador-demo-token`);
await assertHttpOk(`${baseUrl}/screen/evento-demo`);

const imageBuffer = await sharp({
  create: {
    background: "#9a5a44",
    channels: 3,
    height: 64,
    width: 64,
  },
})
  .png()
  .toBuffer();
const formData = new FormData();
const smokeId = `smoke-${Date.now()}`;

formData.append("guestName", "Smoke Test");
formData.append("message_0", smokeId);
formData.append(
  "photos",
  new Blob([imageBuffer], { type: "image/png" }),
  "smoke.png",
);

const uploadResponse = await fetch(`${baseUrl}/api/events/evento-demo/photos`, {
  body: formData,
  method: "POST",
});
const uploadPayload = await uploadResponse.json();

await assertOk(
  uploadResponse.ok,
  `Upload failed: ${uploadResponse.status} ${JSON.stringify(uploadPayload)}`,
);
await assertOk(uploadPayload.uploaded === 1, "Expected exactly one uploaded photo");

const photoResult = await client.query(
  `
    SELECT "id", "status"
    FROM "Photo"
    WHERE "message" = $1
    ORDER BY "uploadedAt" DESC
    LIMIT 1
  `,
  [smokeId],
);
const photo = photoResult.rows[0];

await assertOk(photo, "Uploaded smoke photo was not found in database");
await assertOk(photo.status === "PENDING", "Uploaded smoke photo should start pending");

await client.query(
  `
    UPDATE "Photo"
    SET "status" = 'APPROVED', "updatedAt" = NOW()
    WHERE "id" = $1
  `,
  [photo.id],
);

const approvedResponse = await fetch(
  `${baseUrl}/api/events/evento-demo/approved-photos`,
);
const approvedPayload = await approvedResponse.json();

await assertOk(
  approvedResponse.ok,
  `Approved photos endpoint failed: ${approvedResponse.status}`,
);
await assertOk(
  approvedPayload.photos.some((approvedPhoto) => approvedPhoto.id === photo.id),
  "Approved smoke photo was not returned by the screen feed endpoint",
);

await client.end();

console.log("Smoke demo OK");
console.log(`- Photo: ${photo.id}`);
console.log(`- Upload: ${baseUrl}/e/evento-demo`);
console.log(`- Moderacao: ${baseUrl}/moderate/moderador-demo-token`);
console.log(`- Telao: ${baseUrl}/screen/evento-demo`);
