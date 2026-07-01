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
      className="min-h-screen px-5 py-8 text-[#1D1108]"
      style={{ backgroundColor: event.secondaryColor ?? "#FBF5EE" }}
    >
      <section className="mx-auto max-w-2xl">
        <p
          className="font-[family-name:var(--font-display)] text-3xl italic"
          style={{ color: event.primaryColor ?? "#D4562B" }}
        >
          revela
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold italic leading-tight text-[#1D1108]">
          {event.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#8A6B55]">
          Envie suas fotos para a moderação. As fotos aprovadas poderao aparecer
          no telão do evento.
        </p>

        {event.status === EventStatus.ACTIVE ? (
          <PhotoUploadForm
            authorizationText={event.authorizationText}
            eventSlug={slug}
          />
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold italic text-[#1D1108]">
              {event.status === EventStatus.DRAFT
                ? "Evento ainda nao aberto"
                : "Envio encerrado"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#8A6B55]">
              {event.status === EventStatus.DRAFT
                ? "Este evento ainda nao está recebendo fotos."
                : "O envio de fotos deste evento foi encerrado."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
