import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { extensionByMimeType } from "@/lib/storage/shared";
import type { StorageAdapter } from "@/lib/storage/types";

function requiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} nao configurado.`);
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
    const optimizedKey = `uploads/${eventId}/optimized/${fileId}.webp`;
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
      uploadR2Object({
        body: buffer,
        contentType: mimeType,
        key: originalKey,
      }),
      uploadR2Object({
        body: optimizedBuffer,
        contentType: "image/webp",
        key: optimizedKey,
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
    const fileId = randomUUID();
    const optimizedKey = `uploads/${eventId}/invitation/${fileId}.webp`;
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

    return {
      invitationImageUrl: await uploadR2Object({
        body: optimizedBuffer,
        contentType: "image/webp",
        key: optimizedKey,
      }),
    };
  },
};
