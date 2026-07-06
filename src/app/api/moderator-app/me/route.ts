import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  const counts = await prisma.photo.groupBy({
    by: ["status"],
    where: { eventId: auth.moderator.eventId },
    _count: { status: true },
  });
  const countByStatus = new Map(
    counts.map((item) => [item.status, item._count.status]),
  );

  return NextResponse.json({
    counts: {
      approved: countByStatus.get(PhotoStatus.APPROVED) ?? 0,
      pending: countByStatus.get(PhotoStatus.PENDING) ?? 0,
      rejected: countByStatus.get(PhotoStatus.REJECTED) ?? 0,
    },
    event: {
      id: auth.moderator.event.id,
      moderationMode: auth.moderator.event.moderationMode,
      name: auth.moderator.event.name,
      publicSlug: auth.moderator.event.publicSlug,
      status: auth.moderator.event.status,
    },
    moderator: {
      id: auth.moderator.id,
      name: auth.moderator.name,
      status: auth.moderator.status,
    },
    permissions: {
      canApprove: true,
      canReject: true,
      canRegisterPushToken: true,
    },
  });
}
