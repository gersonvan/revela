import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createQrCodeSvgDataUrl } from "@/lib/qrcode/data-url";

export const runtime = "nodejs";

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
  const qrCodeDataUrl = await createQrCodeSvgDataUrl(uploadUrl);
  const fileName = `${slugifyFileName(event.name)}-qr-code.svg`;
  const svg = createPrintableQrSvg({ eventName: event.name, qrCodeDataUrl });

  return new NextResponse(svg, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}

function createPrintableQrSvg({
  eventName,
  qrCodeDataUrl,
}: {
  eventName: string;
  qrCodeDataUrl: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" rx="56" fill="#FBF5EE"/>
  <rect x="92" y="92" width="896" height="1166" rx="48" fill="#FFFFFF" stroke="#E8DDD1" stroke-width="3"/>
  <text x="540" y="202" text-anchor="middle" fill="#D4562B" font-family="Georgia, serif" font-size="86" font-style="italic">revela</text>
  <text x="540" y="278" text-anchor="middle" fill="#8A6B55" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="4">PARTICIPE DO MURAL</text>
  <image href="${qrCodeDataUrl}" x="190" y="330" width="700" height="700"/>
  <text x="540" y="1098" text-anchor="middle" fill="#1D1108" font-family="Arial, sans-serif" font-size="76" font-weight="800">Envie sua foto</text>
  <text x="540" y="1162" text-anchor="middle" fill="#8A6B55" font-family="Arial, sans-serif" font-size="34">Aponte a câmera para participar</text>
  <text x="540" y="1228" text-anchor="middle" fill="#B09585" font-family="Arial, sans-serif" font-size="26">${escapeXml(eventName)}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
