import { NextResponse } from "next/server";
import { PhotoStatus } from "@/generated/prisma/enums";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { moderatePhotoForModerator } from "@/lib/moderation/decisions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PhotoDecisionContext = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function POST(request: Request, context: PhotoDecisionContext) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  const body = await request.json().catch(() => null);
  const nextStatus = String(body?.nextStatus ?? "") as PhotoStatus;
  const { photoId } = await context.params;

  const result = await moderatePhotoForModerator({
    eventId: auth.moderator.eventId,
    moderatorId: auth.moderator.id,
    nextStatus,
    photoId,
  });

  if (result.status === "invalid") {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ error: result.message }, { status: 404 });
  }

  if (result.status === "conflict") {
    return NextResponse.json({ error: result.message }, { status: 409 });
  }

  return NextResponse.json({
    action: result.action,
    newStatus: result.newStatus,
    pendingCount: result.pendingCount,
    photoId: result.photoId,
    previousStatus: result.previousStatus,
  });
}
