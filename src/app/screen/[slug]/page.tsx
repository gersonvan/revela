import { notFound } from "next/navigation";
import { PhotoStatus } from "@/generated/prisma/enums";
import { LivePhotoFeed } from "@/components/screen/live-photo-feed";
import { createQrCodeDataUrl } from "@/lib/qrcode/data-url";
import { prisma } from "@/lib/prisma";

type ScreenPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ScreenPage({ params }: ScreenPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      invitationImageUrl: true,
      name: true,
      primaryColor: true,
      publicSlug: true,
      secondaryColor: true,
    },
  });

  if (!event) {
    notFound();
  }

  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      status: PhotoStatus.APPROVED,
    },
    orderBy: {
      uploadedAt: "desc",
    },
    take: 80,
    select: {
      guestName: true,
      id: true,
      message: true,
      optimizedFileUrl: true,
      originalFileUrl: true,
      uploadedAt: true,
    },
  });
  const uploadUrl = `${process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3000"}/e/${
    event.publicSlug
  }`;
  const qrCodeDataUrl = await createQrCodeDataUrl(uploadUrl);
  const initialPhotos = photos.map((photo) => ({
    guestName: photo.guestName,
    id: photo.id,
    imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
    message: photo.message,
    uploadedAt: photo.uploadedAt.toISOString(),
  }));

  return (
    <main
      className="relative min-h-screen overflow-hidden text-[#1D1108]"
      style={{ backgroundColor: event.secondaryColor ?? "#FBF5EE" }}
    >
      {initialPhotos.length === 0 ? (
        <EmptyScreen
          eventName={event.name}
          invitationImageUrl={event.invitationImageUrl}
          primaryColor={event.primaryColor ?? "#D4562B"}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      ) : (
        <LivePhotoFeed eventSlug={slug} initialPhotos={initialPhotos} />
      )}

      <aside className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="QR Code do evento" className="h-24 w-24" src={qrCodeDataUrl} />
        <div className="max-w-48">
          <p className="text-sm font-bold text-[#1D1108]">Envie suas fotos</p>
          <p className="mt-1 text-xs leading-5 text-[#8A6B55]">
            Aponte a camera para participar do mural.
          </p>
        </div>
      </aside>
    </main>
  );
}

function EmptyScreen({
  eventName,
  invitationImageUrl,
  primaryColor,
  qrCodeDataUrl,
}: {
  eventName: string;
  invitationImageUrl: string | null;
  primaryColor: string;
  qrCodeDataUrl: string;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center px-8 py-10">
      {invitationImageUrl ? (
        <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_360px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="max-h-[82vh] w-full rounded-2xl object-contain shadow-xl"
            src={invitationImageUrl}
          />
          <QrPanel
            eventName={eventName}
            primaryColor={primaryColor}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        </div>
      ) : (
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <p
              className="font-[family-name:var(--font-display)] text-5xl italic"
              style={{ color: primaryColor }}
            >
              revela
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-6xl font-semibold italic leading-tight text-[#1D1108]">
              {eventName}
            </h1>
            <p className="mt-6 max-w-2xl text-2xl leading-9 text-[#8A6B55]">
              Envie suas fotos para aparecer no telão apos a aprovação da
              moderação.
            </p>
          </div>
          <QrPanel
            eventName={eventName}
            primaryColor={primaryColor}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        </div>
      )}
    </section>
  );
}

function QrPanel({
  eventName,
  primaryColor,
  qrCodeDataUrl,
}: {
  eventName: string;
  primaryColor: string;
  qrCodeDataUrl: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
      <p className="text-sm font-semibold text-[#8A6B55]">{eventName}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="QR Code do evento"
        className="mx-auto mt-4 h-64 w-64"
        src={qrCodeDataUrl}
      />
      <p
        className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold italic"
        style={{ color: primaryColor }}
      >
        Envie suas fotos
      </p>
    </div>
  );
}
