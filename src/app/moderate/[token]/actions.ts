"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ModerationAction,
  ModeratorStatus,
  PhotoStatus,
} from "@/generated/prisma/enums";
import { createDeviceId } from "@/lib/moderation/token";
import { getModeratorAccess, requireModerator } from "@/lib/moderation/access";
import { prisma } from "@/lib/prisma";

export async function activateModeratorAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const access = await getModeratorAccess(token);

  if (access.status !== "activation_required" || !access.moderator) {
    throw new Error("Este link nao pode ser ativado.");
  }

  const deviceId = createDeviceId();

  await prisma.moderator.update({
    where: { id: access.moderator.id },
    data: {
      activatedAt: new Date(),
      deviceId,
      lastAccessAt: new Date(),
      status: ModeratorStatus.USED,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(`eventoon:moderator:${access.moderator.id}`, deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/moderate/${token}`);
}

export async function moderatePhotoAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "") as PhotoStatus;
  const moderator = await requireModerator(token);

  if (
    nextStatus !== PhotoStatus.APPROVED &&
    nextStatus !== PhotoStatus.REJECTED
  ) {
    throw new Error("Status de foto invalido.");
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      eventId: moderator.eventId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!photo) {
    throw new Error("Foto nao encontrada.");
  }

  const action =
    photo.status === PhotoStatus.REJECTED && nextStatus === PhotoStatus.APPROVED
      ? ModerationAction.RESTORED
      : nextStatus === PhotoStatus.APPROVED
        ? ModerationAction.APPROVED
        : ModerationAction.REJECTED;

  await prisma.$transaction([
    prisma.photo.update({
      where: { id: photo.id },
      data: { status: nextStatus },
    }),
    prisma.moderationDecision.create({
      data: {
        photoId: photo.id,
        moderatorId: moderator.id,
        action,
        previousStatus: photo.status,
        newStatus: nextStatus,
      },
    }),
  ]);

  revalidatePath(`/moderate/${token}`);
}
