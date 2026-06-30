import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  extensionByMimeType,
  mediaUrlToStoragePath,
} from "@/lib/storage/shared";
import type { StorageAdapter } from "@/lib/storage/types";

const STORAGE_ROOT = path.join(process.cwd(), "storage");
const UPLOAD_ROOT = path.join(STORAGE_ROOT, "uploads");

export function getStoragePath(relativePath: string) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(STORAGE_ROOT, normalized);
}

export const localStorageAdapter: StorageAdapter = {
  readStoredFile(relativePath) {
    return readFile(getStoragePath(mediaUrlToStoragePath(relativePath)));
  },

  async saveEventPhoto({ eventId, file }) {
  const mimeType = file.type;
  const extension = extensionByMimeType[mimeType];
  const fileId = randomUUID();
  const eventDirectory = path.join(UPLOAD_ROOT, eventId);
  const originalRelativePath = path.join(
    "uploads",
    eventId,
    "original",
    `${fileId}.${extension}`,
  );
  const optimizedRelativePath = path.join(
    "uploads",
    eventId,
    "optimized",
    `${fileId}.webp`,
  );
  const originalPath = getStoragePath(originalRelativePath);
  const optimizedPath = getStoragePath(optimizedRelativePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(path.join(eventDirectory, "original"), { recursive: true });
  await mkdir(path.join(eventDirectory, "optimized"), { recursive: true });
  await writeFile(originalPath, buffer);

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  await image
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(optimizedPath);

  return {
    originalFileUrl: `/media/${originalRelativePath}`,
    optimizedFileUrl: `/media/${optimizedRelativePath}`,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
  },

  async saveEventInvitation({ eventId, file }) {
  const mimeType = file.type;
  const extension = extensionByMimeType[mimeType];
  const fileId = randomUUID();
  const eventDirectory = path.join(UPLOAD_ROOT, eventId, "invitation");
  const originalRelativePath = path.join(
    "uploads",
    eventId,
    "invitation",
    `${fileId}.${extension}`,
  );
  const optimizedRelativePath = path.join(
    "uploads",
    eventId,
    "invitation",
    `${fileId}.webp`,
  );
  const originalPath = getStoragePath(originalRelativePath);
  const optimizedPath = getStoragePath(optimizedRelativePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(eventDirectory, { recursive: true });
  await writeFile(originalPath, buffer);

  await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: 2200,
      height: 2200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88 })
    .toFile(optimizedPath);

  return {
    invitationImageUrl: `/media/${optimizedRelativePath}`,
  };
  },
};
