import { NextResponse } from "next/server";
import { authenticateModeratorAppRequest } from "@/lib/moderation/app-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(request: Request) {
  const auth = await authenticateModeratorAppRequest(request);

  if (auth.status === "error") {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.statusCode },
    );
  }

  await prisma.moderatorSession.update({
    where: { id: auth.session.id },
    data: {
      pushToken: null,
      revokedAt: new Date(),
    },
  });

  return new NextResponse(null, { status: 204 });
}
