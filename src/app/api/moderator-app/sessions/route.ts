import { NextResponse } from "next/server";
import { ModeratorStatus } from "@/generated/prisma/enums";
import {
  createModeratorSessionToken,
  moderatorSessionExpiresAt,
} from "@/lib/moderation/app-session";
import { createDeviceId, hashSecretToken } from "@/lib/moderation/token";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const inviteToken = String(body?.inviteToken ?? "").trim();
  const deviceId = String(body?.deviceId ?? "").trim() || createDeviceId();
  const platform = optionalString(body?.platform);
  const appVersion = optionalString(body?.appVersion);
  const deviceName = optionalString(body?.deviceName);

  if (!inviteToken) {
    return NextResponse.json(
      { error: "Token de convite obrigatório." },
      { status: 400 },
    );
  }

  const moderator = await prisma.moderator.findUnique({
    where: { tokenHash: hashSecretToken(inviteToken) },
    include: { event: true },
  });

  if (!moderator) {
    return NextResponse.json(
      { error: "Convite inválido." },
      { status: 401 },
    );
  }

  if (moderator.status === ModeratorStatus.REVOKED) {
    return NextResponse.json(
      { error: "Moderador revogado." },
      { status: 403 },
    );
  }

  if (moderator.deviceId && moderator.deviceId !== deviceId) {
    return NextResponse.json(
      { error: "Convite já ativado em outro dispositivo." },
      { status: 403 },
    );
  }

  const sessionToken = createModeratorSessionToken();
  const sessionTokenHash = hashSecretToken(sessionToken);

  await prisma.$transaction(async (tx) => {
    await tx.moderator.update({
      where: { id: moderator.id },
      data: {
        activatedAt: moderator.activatedAt ?? new Date(),
        deviceId,
        lastAccessAt: new Date(),
        status: ModeratorStatus.USED,
      },
    });

    await tx.moderatorSession.create({
      data: {
        appVersion,
        deviceId,
        deviceName,
        expiresAt: moderatorSessionExpiresAt(),
        moderatorId: moderator.id,
        platform,
        tokenHash: sessionTokenHash,
      },
    });
  });

  return NextResponse.json(
    {
      event: {
        id: moderator.event.id,
        moderationMode: moderator.event.moderationMode,
        name: moderator.event.name,
      },
      moderator: {
        id: moderator.id,
        name: moderator.name,
      },
      sessionToken,
    },
    { status: 201 },
  );
}

function optionalString(value: unknown) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue || null;
}
