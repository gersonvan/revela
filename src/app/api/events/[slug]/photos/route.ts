import { NextResponse } from "next/server";
import { EventStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { isSupportedImageType, saveEventPhoto } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const revalidate = 0;

const MAX_FILES = 15;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 120;

type UploadRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, context: UploadRouteContext) {
  const { slug } = await context.params;
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      status: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Evento não encontrado." },
      { status: 404 },
    );
  }

  if (event.status !== EventStatus.ACTIVE) {
    return NextResponse.json(
      { error: "Este evento não está aberto para envio de fotos." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const guestName = String(formData.get("guestName") ?? "").trim();
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File);

  if (!guestName) {
    return NextResponse.json(
      { error: "Nome ou apelido e obrigatorio." },
      { status: 400 },
    );
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Selecione pelo menos uma foto." },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Envie no máximo ${MAX_FILES} fotos por vez.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (!isSupportedImageType(file.type)) {
      return NextResponse.json(
        { error: "Uma ou mais fotos usam um formato não suportado." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Uma ou mais fotos passam de 20 MB." },
        { status: 400 },
      );
    }
  }

  const createdPhotos = [];

  for (const [index, file] of files.entries()) {
    const message = String(formData.get(`message_${index}`) ?? "").trim();

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Cada mensagem pode ter no máximo 120 caracteres." },
        { status: 400 },
      );
    }

    const storedFile = await saveEventPhoto({
      eventId: event.id,
      file,
    });

    const photo = await prisma.photo.create({
      data: {
        eventId: event.id,
        guestName,
        message: message || null,
        originalFileUrl: storedFile.originalFileUrl,
        optimizedFileUrl: storedFile.optimizedFileUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        width: storedFile.width,
        height: storedFile.height,
      },
      select: {
        id: true,
      },
    });

    createdPhotos.push(photo);
  }

  return NextResponse.json({
    uploaded: createdPhotos.length,
    photoIds: createdPhotos.map((photo) => photo.id),
  });
}
