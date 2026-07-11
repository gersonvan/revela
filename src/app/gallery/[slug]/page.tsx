import { notFound } from "next/navigation";
import { PhotoStatus } from "@/generated/prisma/enums";
import { GuestGallery } from "@/components/gallery/guest-gallery";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 36;

type GalleryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: {
      galleryEnabled: true,
      id: true,
      name: true,
      primaryColor: true,
    },
  });

  if (!event?.galleryEnabled) {
    notFound();
  }

  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      status: PhotoStatus.APPROVED,
    },
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    select: {
      guestName: true,
      id: true,
      optimizedFileUrl: true,
      originalFileUrl: true,
    },
  });
  const hasMore = photos.length > PAGE_SIZE;
  const initialPhotos = hasMore ? photos.slice(0, PAGE_SIZE) : photos;
  const totalPhotoCount = await prisma.photo.count({
    where: {
      eventId: event.id,
      status: PhotoStatus.APPROVED,
    },
  });

  return (
    <GuestGallery
      eventName={event.name}
      eventSlug={slug}
      initialNextCursor={hasMore ? initialPhotos.at(-1)?.id ?? null : null}
      initialPhotos={initialPhotos.map((photo) => ({
        guestName: photo.guestName,
        id: photo.id,
        imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
      }))}
      primaryColor={event.primaryColor ?? "#D4562B"}
      totalPhotoCount={totalPhotoCount}
    />
  );
}
