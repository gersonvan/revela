import { notFound } from "next/navigation";
import { EventStatus } from "@/generated/prisma/enums";
import { PhotoUploadForm } from "@/components/upload/photo-upload-form";
import { prisma } from "@/lib/prisma";

type PublicEventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { publicSlug: slug },
    select: {
      authorizationText: true,
      name: true,
      primaryColor: true,
      secondaryColor: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <main
      className="min-h-screen px-5 py-8 text-[#1f2933]"
      style={{ backgroundColor: event.secondaryColor ?? "#f6f4ef" }}
    >
      <section className="mx-auto max-w-2xl">
        <p
          className="text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ color: event.primaryColor ?? "#9a5a44" }}
        >
          EventoOn
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#172026]">
          {event.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#52616b]">
          Envie suas fotos para a moderacao. As fotos aprovadas poderao aparecer
          no telao do evento.
        </p>

        {event.status === EventStatus.ACTIVE ? (
          <PhotoUploadForm
            authorizationText={event.authorizationText}
            eventSlug={slug}
          />
        ) : (
          <div className="mt-8 rounded-lg border border-[#ddd5c7] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#172026]">
              {event.status === EventStatus.DRAFT
                ? "Evento ainda nao aberto"
                : "Envio encerrado"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#52616b]">
              {event.status === EventStatus.DRAFT
                ? "Este evento ainda nao esta recebendo fotos."
                : "O envio de fotos deste evento foi encerrado."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
