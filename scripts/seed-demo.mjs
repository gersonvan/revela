import crypto from "node:crypto";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/eventoon";
const moderatorToken = "moderador-demo-token";
const moderatorTokenHash = crypto
  .createHash("sha256")
  .update(moderatorToken)
  .digest("hex");
const client = new pg.Client({ connectionString });

await client.connect();

await client.query(`
  INSERT INTO "Admin" ("id", "name", "email", "createdAt", "updatedAt")
  VALUES ('admin_demo', 'Admin Demo', 'demo@revela.local', NOW(), NOW())
  ON CONFLICT ("email") DO UPDATE SET "updatedAt" = NOW();
`);

await client.query(`
  INSERT INTO "Event" (
    "id",
    "adminId",
    "name",
    "publicSlug",
    "status",
    "primaryColor",
    "secondaryColor",
    "authorizationText",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    'event_demo',
    'admin_demo',
    'Evento Demo',
    'evento-demo',
    'ACTIVE',
    '#9a5a44',
    '#f6f4ef',
    'Ao enviar, voce autoriza que esta foto apareca no telao da festa apos moderacao.',
    NOW(),
    NOW()
  )
  ON CONFLICT ("publicSlug") DO UPDATE
  SET "status" = 'ACTIVE', "updatedAt" = NOW();
`);

await client.query(
  `
    INSERT INTO "Moderator" ("id", "eventId", "name", "tokenHash", "status", "createdAt")
    VALUES ('moderator_demo', 'event_demo', 'Moderador Demo', $1, 'CREATED', NOW())
    ON CONFLICT ("tokenHash") DO UPDATE
    SET "status" = 'CREATED',
        "deviceId" = NULL,
        "activatedAt" = NULL,
        "revokedAt" = NULL;
  `,
  [moderatorTokenHash],
);

await client.end();

console.log("Demo local criado:");
console.log("- Upload: http://127.0.0.1:3000/e/evento-demo");
console.log("- Moderacao: http://127.0.0.1:3000/moderate/moderador-demo-token");
console.log("- Telao: http://127.0.0.1:3000/screen/evento-demo");
