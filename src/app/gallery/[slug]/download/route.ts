import JSZip from "jszip";
import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { mediaUrlToStoragePath, readStoredFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const MAX_SELECTED_PHOTOS = 300;

type GalleryDownloadContext = {
  params: Promise<{
    slug: string;
  }>;
};

type GalleryDownloadRequest = {
  allApproved?: boolean;
  excludedPhotoIds?: unknown;
  photoIds?: unknown;
};

export async function POST(request: Request, context: GalleryDownloadContext) {
  const { slug } = await context.params;
  const body = (await request.json()) as GalleryDownloadRequest;
  const photoIds = parsePhotoIds(body.photoIds);
  const excludedPhotoIds = parsePhotoIds(body.excludedPhotoIds);
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: { galleryEnabled: true, id: true, name: true, publicSlug: true },
  });

  if (!event?.galleryEnabled) {
    return NextResponse.json({ error: "Galeria não encontrada." }, { status: 404 });
  }

  const selectedPhotoFilter = body.allApproved
    ? { notIn: excludedPhotoIds }
    : { in: photoIds };
  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      id: selectedPhotoFilter,
      status: PhotoStatus.APPROVED,
    },
    orderBy: [{ uploadedAt: "asc" }, { id: "asc" }],
    take: MAX_SELECTED_PHOTOS + 1,
    select: {
      guestName: true,
      id: true,
      originalFileUrl: true,
    },
  });

  if (photos.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos uma foto." }, { status: 400 });
  }

  if (photos.length > MAX_SELECTED_PHOTOS) {
    return NextResponse.json(
      { error: `Baixe no máximo ${MAX_SELECTED_PHOTOS} fotos por vez.` },
      { status: 400 },
    );
  }

  const zip = new JSZip();
  const indexWidth = Math.max(2, String(photos.length).length);
  let addedFiles = 0;

  for (const [index, photo] of photos.entries()) {
    const extension = getExtension(photo.originalFileUrl);
    const fileName = `${String(index + 1).padStart(indexWidth, "0")}-${slugifyFileName(
      photo.guestName,
    )}-${photo.id}.${extension}`;

    try {
      const file = await readStoredFile(mediaUrlToStoragePath(photo.originalFileUrl));
      zip.file(fileName, file);
      addedFiles += 1;
    } catch {
      // A single missing object must not block the rest of the selected delivery.
    }
  }

  if (addedFiles === 0) {
    return NextResponse.json(
      { error: "As fotos selecionadas não estão disponíveis para download agora." },
      { status: 503 },
    );
  }

  const content = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(content, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${event.publicSlug}-fotos.zip"`,
      "Content-Type": "application/zip",
    },
  });
}

function parsePhotoIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((photoId): photoId is string => typeof photoId === "string").slice(0, MAX_SELECTED_PHOTOS);
}

function getExtension(mediaUrl: string) {
  return mediaUrlToStoragePath(mediaUrl).split(".").pop() ?? "jpg";
}

function slugifyFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "foto"
  );
}
