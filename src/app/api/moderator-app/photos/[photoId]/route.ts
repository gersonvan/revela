import { NextResponse } from "next/server";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PhotoDetailContext = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function GET(request: Request, context: PhotoDetailContext) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  const { photoId } = await context.params;
  const photo = await prisma.photo.findFirst({
    where: {
      eventId: auth.moderator.eventId,
      id: photoId,
    },
    select: {
      guestName: true,
      height: true,
      id: true,
      message: true,
      mimeType: true,
      optimizedFileUrl: true,
      originalFileUrl: true,
      sizeBytes: true,
      status: true,
      uploadedAt: true,
      width: true,
    },
  });

  if (!photo) {
    return NextResponse.json(
      { error: "Foto não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    guestName: photo.guestName,
    height: photo.height,
    id: photo.id,
    imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
    message: photo.message,
    mimeType: photo.mimeType,
    sizeBytes: photo.sizeBytes,
    status: photo.status,
    uploadedAt: photo.uploadedAt.toISOString(),
    width: photo.width,
  });
}
