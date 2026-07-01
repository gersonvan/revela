import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import {
  extensionByMimeType,
  mediaUrlToStoragePath,
} from "@/lib/storage/shared";
import type { StorageAdapter } from "@/lib/storage/types";

async function uploadPublicBlob({
  contentType,
  pathname,
  buffer,
}: {
  buffer: Buffer;
  contentType: string;
  pathname: string;
}) {
  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });

  return blob.url;
}

export const vercelBlobStorageAdapter: StorageAdapter = {
  async readStoredFile(mediaPathOrUrl) {
    const url = mediaPathOrUrl.startsWith("http")
      ? mediaPathOrUrl
      : mediaUrlToStoragePath(mediaPathOrUrl);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Arquivo não encontrado: ${url}`);
    }

    return Buffer.from(await response.arrayBuffer());
  },

  async saveEventPhoto({ eventId, file }) {
    const sharp = (await import("sharp")).default;
    const mimeType = file.type;
    const extension = extensionByMimeType[mimeType];
    const fileId = randomUUID();
    const originalPath = `uploads/${eventId}/original/${fileId}.${extension}`;
    const optimizedPath = `uploads/${eventId}/optimized/${fileId}.webp`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();
    const optimizedBuffer = await image
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    const [originalFileUrl, optimizedFileUrl] = await Promise.all([
      uploadPublicBlob({
        buffer,
        contentType: mimeType,
        pathname: originalPath,
      }),
      uploadPublicBlob({
        buffer: optimizedBuffer,
        contentType: "image/webp",
        pathname: optimizedPath,
      }),
    ]);

    return {
      originalFileUrl,
      optimizedFileUrl,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    };
  },

  async saveEventInvitation({ eventId, file }) {
    const sharp = (await import("sharp")).default;
    const fileId = randomUUID();
    const optimizedPath = `uploads/${eventId}/invitation/${fileId}.webp`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();

    const invitationImageUrl = await uploadPublicBlob({
      buffer: optimizedBuffer,
      contentType: "image/webp",
      pathname: optimizedPath,
    });

    return {
      invitationImageUrl,
    };
  },
};
