import JSZip from "jszip";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { mediaUrlToStoragePath, readStoredFile } from "@/lib/storage";

type EventExportZipContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_request: Request, context: EventExportZipContext) {
  const admin = await requireAdmin();
  const { eventId } = await context.params;
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      adminId: admin.id,
    },
    include: {
      photos: {
        orderBy: {
          uploadedAt: "asc",
        },
        include: {
          decisions: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              moderator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Evento nao encontrado." }, { status: 404 });
  }

  const zip = new JSZip();
  const metadata = {
    exportedAt: new Date().toISOString(),
    event: {
      id: event.id,
      name: event.name,
      publicSlug: event.publicSlug,
      status: event.status,
    },
    photos: event.photos.map((photo) => ({
      decisions: photo.decisions.map((decision) => ({
        action: decision.action,
        createdAt: decision.createdAt.toISOString(),
        moderator: decision.moderator,
        newStatus: decision.newStatus,
        previousStatus: decision.previousStatus,
      })),
      guestName: photo.guestName,
      id: photo.id,
      message: photo.message,
      optimizedFileUrl: photo.optimizedFileUrl,
      originalFileUrl: photo.originalFileUrl,
      status: photo.status,
      uploadedAt: photo.uploadedAt.toISOString(),
    })),
  };

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  for (const [index, photo] of event.photos.entries()) {
    await addMediaFileToZip({
      directory: `photos/${photo.status.toLowerCase()}`,
      fallbackName: `${String(index + 1).padStart(3, "0")}-${photo.id}`,
      mediaUrl: photo.originalFileUrl,
      zip,
    });

    if (photo.optimizedFileUrl) {
      await addMediaFileToZip({
        directory: `photos/${photo.status.toLowerCase()}/optimized`,
        fallbackName: `${String(index + 1).padStart(3, "0")}-${photo.id}`,
        mediaUrl: photo.optimizedFileUrl,
        zip,
      });
    }
  }

  const content = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(content, {
    headers: {
      "Content-Disposition": `attachment; filename="${event.publicSlug}-photos.zip"`,
      "Content-Type": "application/zip",
    },
  });
}

async function addMediaFileToZip({
  directory,
  fallbackName,
  mediaUrl,
  zip,
}: {
  directory: string;
  fallbackName: string;
  mediaUrl: string;
  zip: JSZip;
}) {
  try {
    const storagePathOrUrl = mediaUrlToStoragePath(mediaUrl);
    const extension = storagePathOrUrl.split(".").pop() ?? "bin";
    const file = await readStoredFile(storagePathOrUrl);

    zip.file(`${directory}/${fallbackName}.${extension}`, file);
  } catch {
    zip.file(
      `${directory}/${fallbackName}.missing.txt`,
      `Arquivo nao encontrado: ${mediaUrl}`,
    );
  }
}
