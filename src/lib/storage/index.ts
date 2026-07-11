import { cloudflareR2StorageAdapter } from "@/lib/storage/cloudflare-r2";
import { localStorageAdapter } from "@/lib/storage/local";
import { isSupportedImageType, mediaUrlToStoragePath } from "@/lib/storage/shared";
import type { StorageAdapter } from "@/lib/storage/types";
import { vercelBlobStorageAdapter } from "@/lib/storage/vercel-blob";

function getStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "local") {
    return localStorageAdapter;
  }

  if (provider === "vercel-blob") {
    return vercelBlobStorageAdapter;
  }

  if (provider === "cloudflare-r2") {
    return cloudflareR2StorageAdapter;
  }

  throw new Error(`STORAGE_PROVIDER inválido: ${provider}`);
}

export function readStoredFile(mediaPathOrUrl: string) {
  return getStorageAdapter().readStoredFile(mediaPathOrUrl);
}

export function saveEventInvitation(
  input: Parameters<StorageAdapter["saveEventInvitation"]>[0],
) {
  return getStorageAdapter().saveEventInvitation(input);
}

export function saveEventPhoto(input: Parameters<StorageAdapter["saveEventPhoto"]>[0]) {
  return getStorageAdapter().saveEventPhoto(input);
}

export { isSupportedImageType, mediaUrlToStoragePath };
