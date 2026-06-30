import Link from "next/link";
import { EventStatus } from "@/generated/prisma/enums";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
};

const statusClass: Record<EventStatus, string> = {
  DRAFT: "bg-[#F4EDE1] text-[#8A6B55]",
  ACTIVE: "bg-[rgba(22,163,74,0.10)] text-[#16A34A]",
  CLOSED: "bg-[rgba(29,17,8,0.06)] text-[#8A6B55]",
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar
        activeEventName={events.find((event) => event.status === EventStatus.ACTIVE)?.name}
        adminEmail={admin.email}
      />
      <main className="flex-1 bg-[#FBF5EE] px-6 py-8 text-[#1D1108] md:px-8">
        <header className="flex flex-col gap-4 border-b border-[#E8DDD1] bg-white/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4562B]">
              Admin
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[#1D1108]">
              Eventos
            </h1>
            <p className="mt-2 text-sm text-[#8A6B55]">
              Logado como {admin.email}
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#D4562B] px-5 text-sm font-bold text-white transition hover:bg-[#BA4620]"
            href="/admin/events/new"
          >
            Novo evento
          </Link>
        </header>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#E8DDD1] bg-white shadow-sm">
          {events.length === 0 ? (
            <div className="p-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold italic text-[#1D1108]">
                Nenhum evento criado
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#8A6B55]">
                Crie o primeiro evento para gerar o QR Code, convidar
                moderadores e preparar a tela do telao.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0E8DF]">
              {events.map((event) => (
                <Link
                  className="grid gap-3 p-5 transition hover:bg-[#FBF5EE] sm:grid-cols-[1fr_auto]"
                  href={`/admin/events/${event.id}`}
                  key={event.id}
                >
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold italic text-[#1D1108]">
                      {event.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#8A6B55]">
                      /e/{event.publicSlug}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[event.status]}`}>
                      {statusLabel[event.status]}
                    </span>
                    <span className="rounded-full bg-[#F4EDE1] px-3 py-1 text-xs text-[#8A6B55]">
                      {event._count.photos} fotos
                    </span>
                    <span className="rounded-full bg-[#F4EDE1] px-3 py-1 text-xs text-[#8A6B55]">
                      {event._count.moderators} moderadores
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
