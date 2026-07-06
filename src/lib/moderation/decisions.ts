import { ModerationAction, PhotoStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ModeratePhotoResult =
  | {
      action: ModerationAction;
      newStatus: PhotoStatus;
      pendingCount: number;
      photoId: string;
      previousStatus: PhotoStatus;
      status: "ok";
    }
  | {
      message: string;
      status: "not_found";
    }
  | {
      message: string;
      status: "conflict";
    }
  | {
      message: string;
      status: "invalid";
    };

export function getModerationAction(
  previousStatus: PhotoStatus,
  nextStatus: PhotoStatus,
) {
  if (previousStatus === PhotoStatus.REJECTED && nextStatus === PhotoStatus.APPROVED) {
    return ModerationAction.RESTORED;
  }

  return nextStatus === PhotoStatus.APPROVED
    ? ModerationAction.APPROVED
    : ModerationAction.REJECTED;
}

export async function moderatePhotoForModerator({
  eventId,
  moderatorId,
  nextStatus,
  photoId,
}: {
  eventId: string;
  moderatorId: string;
  nextStatus: PhotoStatus;
  photoId: string;
}): Promise<ModeratePhotoResult> {
  if (
    nextStatus !== PhotoStatus.APPROVED &&
    nextStatus !== PhotoStatus.REJECTED
  ) {
    return {
      message: "Status de foto inválido.",
      status: "invalid",
    };
  }

  const photo = await prisma.photo.findFirst({
    where: {
      eventId,
      id: photoId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!photo) {
    return {
      message: "Foto não encontrada.",
      status: "not_found",
    };
  }

  if (photo.status === nextStatus) {
    return {
      message: "Foto já está neste status.",
      status: "conflict",
    };
  }

  const action = getModerationAction(photo.status, nextStatus);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.photo.updateMany({
      where: {
        eventId,
        id: photo.id,
        status: photo.status,
      },
      data: {
        status: nextStatus,
      },
    });

    if (updateResult.count !== 1) {
      return {
        message: "Foto foi moderada por outra sessão.",
        status: "conflict" as const,
      };
    }

    await tx.moderationDecision.create({
      data: {
        action,
        moderatorId,
        newStatus: nextStatus,
        photoId: photo.id,
        previousStatus: photo.status,
      },
    });

    const pendingCount = await tx.photo.count({
      where: {
        eventId,
        status: PhotoStatus.PENDING,
      },
    });

    return {
      action,
      newStatus: nextStatus,
      pendingCount,
      photoId: photo.id,
      previousStatus: photo.status,
      status: "ok" as const,
    };
  });
}
