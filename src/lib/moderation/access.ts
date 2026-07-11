import { cookies } from "next/headers";
import { ModeratorStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { hashSecretToken } from "@/lib/moderation/token";

export async function getModeratorAccess(token: string) {
  const tokenHash = hashSecretToken(token);
  const moderator = await prisma.moderator.findUnique({
    where: { tokenHash },
    include: {
      event: true,
    },
  });

  if (!moderator || moderator.status === ModeratorStatus.REVOKED) {
    return { status: "invalid" as const, moderator: null };
  }

  if (moderator.status === ModeratorStatus.CREATED) {
    return { status: "activation_required" as const, moderator };
  }

  const cookieStore = await cookies();
  const deviceId = cookieStore.get(`eventoon:moderator:${moderator.id}`)?.value;

  if (!deviceId || deviceId !== moderator.deviceId) {
    return { status: "device_mismatch" as const, moderator: null };
  }

  return { status: "authorized" as const, moderator };
}

export async function requireModerator(token: string) {
  const access = await getModeratorAccess(token);

  if (access.status !== "authorized" || !access.moderator) {
    throw new Error("Acesso de moderador inválido.");
  }

  await prisma.moderator.update({
    where: { id: access.moderator.id },
    data: { lastAccessAt: new Date() },
  });

  return access.moderator;
}
