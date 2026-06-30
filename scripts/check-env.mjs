import fs from "node:fs";

if (fs.existsSync(".env")) {
  const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    process.env[key] ??= rawValue.trim().replace(/^"|"$/g, "");
  }
}

const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const missing = [];

for (const key of required) {
  const value = process.env[key];

  if (!value || value.includes("replace-with") || value.trim() === "") {
    missing.push(key);
  }
}

const storageProvider = process.env.STORAGE_PROVIDER || "local";

if (!["local", "vercel-blob", "cloudflare-r2"].includes(storageProvider)) {
  console.error("Ambiente invalido.");
  console.error("STORAGE_PROVIDER deve ser local, vercel-blob ou cloudflare-r2.");
  process.exit(1);
}

if (storageProvider === "vercel-blob" && !process.env.BLOB_READ_WRITE_TOKEN) {
  missing.push("BLOB_READ_WRITE_TOKEN");
}

if (storageProvider === "cloudflare-r2") {
  for (const key of [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_BASE_URL",
  ]) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }
}

if (missing.length > 0) {
  console.error("Ambiente incompleto.");
  console.error(`Faltando: ${missing.join(", ")}`);
  console.error("");
  console.error("Veja docs/GOOGLE_OAUTH.md e docs/DEPLOY_VERCEL.md.");
  process.exit(1);
}

console.log("Ambiente OK.");
console.log(`NEXTAUTH_URL=${process.env.NEXTAUTH_URL}`);
console.log(`STORAGE_PROVIDER=${storageProvider}`);

if (!process.env.ADMIN_EMAIL_ALLOWLIST?.trim()) {
  console.warn(
    "Aviso: ADMIN_EMAIL_ALLOWLIST vazio. Qualquer conta Google valida podera acessar o admin.",
  );
}
