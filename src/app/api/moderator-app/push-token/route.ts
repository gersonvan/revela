import { NextResponse } from "next/server";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  const body = await request.json().catch(() => null);
  const pushToken = optionalString(body?.pushToken);
  const platform = optionalString(body?.platform);
  const appVersion = optionalString(body?.appVersion);

  if (!pushToken) {
    return NextResponse.json(
      { error: "Push token obrigatório." },
      { status: 400 },
    );
  }

  await prisma.moderatorSession.update({
    where: { id: auth.session.id },
    data: {
      appVersion,
      platform,
      pushToken,
    },
  });

  return new NextResponse(null, { status: 204 });
}

function optionalString(value: unknown) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue || null;
}
