import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type EventExportContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_request: Request, context: EventExportContext) {
  const admin = await requireAdmin();
  const { eventId } = await context.params;
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      adminId: admin.id,
    },
    include: {
      moderators: {
        select: {
          activatedAt: true,
          createdAt: true,
          id: true,
          lastAccessAt: true,
          name: true,
          revokedAt: true,
          status: true,
        },
      },
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

  const payload = {
    exportedAt: new Date().toISOString(),
    event: {
      closedAt: event.closedAt?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      eventDate: event.eventDate?.toISOString() ?? null,
      id: event.id,
      name: event.name,
      publicSlug: event.publicSlug,
      status: event.status,
    },
    moderators: event.moderators.map((moderator) => ({
      activatedAt: moderator.activatedAt?.toISOString() ?? null,
      createdAt: moderator.createdAt.toISOString(),
      id: moderator.id,
      lastAccessAt: moderator.lastAccessAt?.toISOString() ?? null,
      name: moderator.name,
      revokedAt: moderator.revokedAt?.toISOString() ?? null,
      status: moderator.status,
    })),
    photos: event.photos.map((photo) => ({
      decisions: photo.decisions.map((decision) => ({
        action: decision.action,
        createdAt: decision.createdAt.toISOString(),
        id: decision.id,
        moderator: decision.moderator,
        newStatus: decision.newStatus,
        previousStatus: decision.previousStatus,
      })),
      guestName: photo.guestName,
      height: photo.height,
      id: photo.id,
      message: photo.message,
      mimeType: photo.mimeType,
      optimizedFileUrl: photo.optimizedFileUrl,
      originalFileUrl: photo.originalFileUrl,
      sizeBytes: photo.sizeBytes,
      status: photo.status,
      uploadedAt: photo.uploadedAt.toISOString(),
      width: photo.width,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="${event.publicSlug}-export.json"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
