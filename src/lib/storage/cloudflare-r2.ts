import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { extensionByMimeType } from "@/lib/storage/shared";
import type { StorageAdapter } from "@/lib/storage/types";

function requiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} não configurado.`);
  }

  return value;
}

function getR2Client() {
  const accountId = requiredEnv("R2_ACCOUNT_ID");

  return new S3Client({
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });
}

function getPublicUrl(key: string) {
  const publicBaseUrl = requiredEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");

  return `${publicBaseUrl}/${key}`;
}

function keyFromMediaPathOrUrl(mediaPathOrUrl: string) {
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (publicBaseUrl && mediaPathOrUrl.startsWith(`${publicBaseUrl}/`)) {
    return mediaPathOrUrl.slice(publicBaseUrl.length + 1);
  }

  return mediaPathOrUrl.replace(/^\/media\//, "");
}

async function streamToBuffer(stream: unknown) {
  if (!stream || typeof stream !== "object" || !("transformToByteArray" in stream)) {
    throw new Error("Resposta invalida do R2.");
  }

  const body = stream as { transformToByteArray: () => Promise<Uint8Array> };

  return Buffer.from(await body.transformToByteArray());
}

async function uploadR2Object({
  body,
  contentType,
  key,
}: {
  body: Buffer;
  contentType: string;
  key: string;
}) {
  await getR2Client().send(
    new PutObjectCommand({
      Body: body,
      Bucket: requiredEnv("R2_BUCKET_NAME"),
      CacheControl: "public, max-age=31536000, immutable",
      ContentType: contentType,
      Key: key,
    }),
  );

  return getPublicUrl(key);
}

async function optimizeToWebp({
  buffer,
  height,
  quality,
  width,
}: {
  buffer: Buffer;
  height: number;
  quality: number;
  width: number;
}) {
  try {
    const sharp = (await import("sharp")).default;
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();
    const optimizedBuffer = await image
      .resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      contentType: "image/webp",
      extension: "webp",
      height: metadata.height ?? null,
      width: metadata.width ?? null,
    };
  } catch (error) {
    console.warn("Sharp indisponivel; usando imagem original no storage.", error);

    return null;
  }
}

export const cloudflareR2StorageAdapter: StorageAdapter = {
  async readStoredFile(mediaPathOrUrl) {
    if (mediaPathOrUrl.startsWith("http")) {
      const response = await fetch(mediaPathOrUrl);

      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
    }

    const response = await getR2Client().send(
      new GetObjectCommand({
        Bucket: requiredEnv("R2_BUCKET_NAME"),
        Key: keyFromMediaPathOrUrl(mediaPathOrUrl),
      }),
    );

    return streamToBuffer(response.Body);
  },

  async saveEventPhoto({ eventId, file }) {
    const mimeType = file.type;
    const extension = extensionByMimeType[mimeType];
    const fileId = randomUUID();
    const originalKey = `uploads/${eventId}/original/${fileId}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeToWebp({
      buffer,
      height: 1920,
      quality: 82,
      width: 1920,
    });
    const optimizedKey = `uploads/${eventId}/optimized/${fileId}.${
      optimized?.extension ?? extension
    }`;

    const [originalFileUrl, optimizedFileUrl] = await Promise.all([
      uploadR2Object({
        body: buffer,
        contentType: mimeType,
        key: originalKey,
      }),
      uploadR2Object({
        body: optimized?.buffer ?? buffer,
        contentType: optimized?.contentType ?? mimeType,
        key: optimizedKey,
      }),
    ]);

    return {
      originalFileUrl,
      optimizedFileUrl,
      width: optimized?.width ?? null,
      height: optimized?.height ?? null,
    };
  },

  async saveEventInvitation({ eventId, file }) {
    const mimeType = file.type;
    const extension = extensionByMimeType[mimeType];
    const fileId = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeToWebp({
      buffer,
      height: 2200,
      quality: 88,
      width: 2200,
    });
    const optimizedKey = `uploads/${eventId}/invitation/${fileId}.${
      optimized?.extension ?? extension
    }`;

    return {
      invitationImageUrl: await uploadR2Object({
        body: optimized?.buffer ?? buffer,
        contentType: optimized?.contentType ?? mimeType,
        key: optimizedKey,
      }),
    };
  },
};
