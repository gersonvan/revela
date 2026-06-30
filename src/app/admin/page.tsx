import Link from "next/link";
import { EventStatus } from "@/generated/prisma/enums";
import { SignOutButton } from "@/components/auth/auth-buttons";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  const events = await prisma.event.findMany({
    where: { adminId: admin.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          photos: true,
          moderators: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#ddd5c7] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#172026]">
              Eventos
            </h1>
            <p className="mt-2 text-sm text-[#52616b]">
              Logado como {admin.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#172026] px-4 text-sm font-semibold text-white transition hover:bg-[#2a3740]"
              href="/admin/events/new"
            >
              Novo evento
            </Link>
            <SignOutButton />
          </div>
        </header>

        <div className="mt-8 overflow-hidden rounded-lg border border-[#ddd5c7] bg-white shadow-sm">
          {events.length === 0 ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-[#172026]">
                Nenhum evento criado
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#52616b]">
                Crie o primeiro evento para gerar o QR Code, convidar
                moderadores e preparar a tela do telao.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ede7dd]">
              {events.map((event) => (
                <Link
                  className="grid gap-3 p-5 transition hover:bg-[#fbfaf7] sm:grid-cols-[1fr_auto]"
                  href={`/admin/events/${event.id}`}
                  key={event.id}
                >
                  <div>
                    <h2 className="text-lg font-semibold text-[#172026]">
                      {event.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#52616b]">
                      /e/{event.publicSlug}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-md bg-[#f6f4ef] px-3 py-1 font-medium text-[#52616b]">
                      {statusLabel[event.status]}
                    </span>
                    <span className="rounded-md bg-[#f6f4ef] px-3 py-1 text-[#52616b]">
                      {event._count.photos} fotos
                    </span>
                    <span className="rounded-md bg-[#f6f4ef] px-3 py-1 text-[#52616b]">
                      {event._count.moderators} moderadores
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
