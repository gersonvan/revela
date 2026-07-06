import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  const url = new URL(request.url);
  const status = parsePhotoStatus(url.searchParams.get("status"));
  const cursor = url.searchParams.get("cursor");
  const limit = parseLimit(url.searchParams.get("limit"));

  if (!status) {
    return NextResponse.json(
      { error: "Status de foto inválido." },
      { status: 400 },
    );
  }

  const [photos, counts] = await Promise.all([
    prisma.photo.findMany({
      where: {
        eventId: auth.moderator.eventId,
        status,
      },
      orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        guestName: true,
        id: true,
        message: true,
        optimizedFileUrl: true,
        originalFileUrl: true,
        status: true,
        uploadedAt: true,
      },
    }),
    prisma.photo.groupBy({
      by: ["status"],
      where: { eventId: auth.moderator.eventId },
      _count: { status: true },
    }),
  ]);

  const hasNextPage = photos.length > limit;
  const items = hasNextPage ? photos.slice(0, limit) : photos;
  const countByStatus = new Map(
    counts.map((item) => [item.status, item._count.status]),
  );

  return NextResponse.json({
    counts: {
      approved: countByStatus.get(PhotoStatus.APPROVED) ?? 0,
      pending: countByStatus.get(PhotoStatus.PENDING) ?? 0,
      rejected: countByStatus.get(PhotoStatus.REJECTED) ?? 0,
    },
    items: items.map(formatPhoto),
    nextCursor: hasNextPage ? items.at(-1)?.id ?? null : null,
  });
}

function parseLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function parsePhotoStatus(value: string | null) {
  if (!value) {
    return PhotoStatus.PENDING;
  }

  return Object.values(PhotoStatus).includes(value as PhotoStatus)
    ? (value as PhotoStatus)
    : null;
}

function formatPhoto(photo: {
  guestName: string;
  id: string;
  message: string | null;
  optimizedFileUrl: string | null;
  originalFileUrl: string;
  status: PhotoStatus;
  uploadedAt: Date;
}) {
  return {
    guestName: photo.guestName,
    id: photo.id,
    imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
    message: photo.message,
    status: photo.status,
    uploadedAt: photo.uploadedAt.toISOString(),
  };
}
