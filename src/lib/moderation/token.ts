import { createHash, randomBytes, randomUUID } from "node:crypto";

export function createSecretToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSecretToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createDeviceId() {
  return randomUUID();
}
