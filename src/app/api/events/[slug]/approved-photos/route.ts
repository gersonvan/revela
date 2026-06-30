import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type ApprovedPhotosContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: ApprovedPhotosContext) {
  const { slug } = await context.params;
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: { id: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Evento nao encontrado." }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      status: PhotoStatus.APPROVED,
    },
    orderBy: {
      uploadedAt: "desc",
    },
    take: 80,
    select: {
      guestName: true,
      id: true,
      message: true,
      optimizedFileUrl: true,
      originalFileUrl: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json({
    photos: photos.map((photo) => ({
      guestName: photo.guestName,
      id: photo.id,
      imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
      message: photo.message,
      uploadedAt: photo.uploadedAt.toISOString(),
    })),
  });
}
