import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 36;

type GalleryContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: GalleryContext) {
  const { slug } = await context.params;
  const cursor = new URL(request.url).searchParams.get("cursor");
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: { galleryEnabled: true, id: true },
  });

  if (!event?.galleryEnabled) {
    return NextResponse.json({ error: "Galeria não encontrada." }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      status: PhotoStatus.APPROVED,
    },
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      guestName: true,
      id: true,
      optimizedFileUrl: true,
      originalFileUrl: true,
    },
  });
  const hasMore = photos.length > PAGE_SIZE;
  const page = hasMore ? photos.slice(0, PAGE_SIZE) : photos;

  return NextResponse.json({
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    photos: page.map((photo) => ({
      guestName: photo.guestName,
      id: photo.id,
      imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
    })),
  });
}
