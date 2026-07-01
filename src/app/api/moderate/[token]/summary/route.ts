import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { getModeratorAccess } from "@/lib/moderation/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ModerationSummaryContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: Request, context: ModerationSummaryContext) {
  const { token } = await context.params;
  const access = await getModeratorAccess(token);

  if (access.status !== "authorized" || !access.moderator) {
    return NextResponse.json({ error: "Acesso inválido." }, { status: 401 });
  }

  const counts = await prisma.photo.groupBy({
    by: ["status"],
    where: {
      eventId: access.moderator.eventId,
    },
    _count: {
      status: true,
    },
  });
  const latestPending = await prisma.photo.findFirst({
    where: {
      eventId: access.moderator.eventId,
      status: PhotoStatus.PENDING,
    },
    orderBy: {
      uploadedAt: "desc",
    },
    select: {
      id: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json({
    counts: Object.fromEntries(
      counts.map((item) => [item.status, item._count.status]),
    ),
    latestPendingId: latestPending?.id ?? null,
    latestPendingAt: latestPending?.uploadedAt.toISOString() ?? null,
  });
}
