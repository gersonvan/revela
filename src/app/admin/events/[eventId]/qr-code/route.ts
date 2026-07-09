import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createPrintableQrPngBuffer } from "@/lib/qrcode/printable-png";

type EventQrCodeContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_request: Request, context: EventQrCodeContext) {
  const admin = await requireAdmin();
  const { eventId } = await context.params;

  const event = await prisma.event.findFirst({
    where: {
      adminId: admin.id,
      id: eventId,
    },
    select: {
      name: true,
      publicSlug: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  const uploadUrl = `${baseUrl}/e/${event.publicSlug}`;
  const fileName = `${slugifyFileName(event.name)}-qr-code.png`;
  const png = await createPrintableQrPngBuffer({
    eventName: event.name,
    uploadUrl,
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "image/png",
    },
  });
}

function slugifyFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "evento"
  );
}
