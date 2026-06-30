import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus, ModeratorStatus } from "@/generated/prisma/enums";
import {
  createModeratorAction,
  revokeModeratorAction,
  updateEventSettingsAction,
  updateEventStatusAction,
} from "@/app/admin/events/actions";
import { requireAdmin } from "@/lib/admin";
import { createQrCodeDataUrl } from "@/lib/qrcode/data-url";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
};

const moderatorStatusLabel: Record<ModeratorStatus, string> = {
  CREATED: "Criado",
  USED: "Usado",
  REVOKED: "Revogado",
};

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    moderatorToken?: string;
  }>;
};

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const admin = await requireAdmin();
  const { eventId } = await params;
  const { moderatorToken } = await searchParams;
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      adminId: admin.id,
    },
    include: {
      _count: {
        select: {
          photos: true,
          moderators: true,
        },
      },
    },
  });
  const moderators = await prisma.moderator.findMany({
    where: { eventId, event: { adminId: admin.id } },
    orderBy: { createdAt: "desc" },
  });
  const photoCounts = await prisma.photo.groupBy({
    by: ["status"],
    where: { eventId, event: { adminId: admin.id } },
    _count: { status: true },
  });
  const moderatorCounts = await prisma.moderator.groupBy({
    by: ["status"],
    where: { eventId, event: { adminId: admin.id } },
    _count: { status: true },
  });

  if (!event) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3000";
  const uploadPath = `/e/${event.publicSlug}`;
  const screenPath = `/screen/${event.publicSlug}`;
  const uploadUrl = `${baseUrl}${uploadPath}`;
  const screenUrl = `${baseUrl}${screenPath}`;
  const qrCodeDataUrl = await createQrCodeDataUrl(uploadUrl);
  const formattedEventDate = event.eventDate
    ? event.eventDate.toISOString().slice(0, 10)
    : "";
  const photoCountByStatus = new Map(
    photoCounts.map((item) => [item.status, item._count.status]),
  );
  const moderatorCountByStatus = new Map(
    moderatorCounts.map((item) => [item.status, item._count.status]),
  );

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto max-w-5xl">
        <Link className="text-sm font-semibold text-[#9a5a44]" href="/admin">
          Voltar para eventos
        </Link>

        <header className="mt-4 flex flex-col gap-4 border-b border-[#ddd5c7] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
              {statusLabel[event.status]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#172026]">
              {event.name}
            </h1>
            <p className="mt-2 text-sm text-[#52616b]">
              Criado em {event.createdAt.toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center rounded-md border border-[#d7cfc1] px-4 text-sm font-semibold text-[#52616b]"
              href={`/admin/events/${event.id}/export`}
            >
              Exportar JSON
            </Link>
            <Link
              className="inline-flex h-10 items-center rounded-md border border-[#d7cfc1] px-4 text-sm font-semibold text-[#52616b]"
              href={`/admin/events/${event.id}/export-zip`}
            >
              Baixar ZIP
            </Link>
            {event.status !== EventStatus.ACTIVE ? (
              <form action={updateEventStatusAction}>
                <input name="eventId" type="hidden" value={event.id} />
                <input name="status" type="hidden" value={EventStatus.ACTIVE} />
                <button
                  className="h-10 rounded-md bg-[#172026] px-4 text-sm font-semibold text-white"
                  type="submit"
                >
                  Ativar
                </button>
              </form>
            ) : null}
            {event.status !== EventStatus.CLOSED ? (
              <form action={updateEventStatusAction}>
                <input name="eventId" type="hidden" value={event.id} />
                <input name="status" type="hidden" value={EventStatus.CLOSED} />
                <button
                  className="h-10 rounded-md border border-[#d7cfc1] px-4 text-sm font-semibold text-[#52616b]"
                  type="submit"
                >
                  Encerrar
                </button>
              </form>
            ) : null}
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Fotos" value={event._count.photos} />
          <Metric label="Pendentes" value={photoCountByStatus.get("PENDING") ?? 0} />
          <Metric label="Aprovadas" value={photoCountByStatus.get("APPROVED") ?? 0} />
          <Metric label="Rejeitadas" value={photoCountByStatus.get("REJECTED") ?? 0} />
          <Metric
            label="Moderadores"
            value={`${moderatorCountByStatus.get("USED") ?? 0}/${event._count.moderators}`}
          />
          <Metric label="Status" value={statusLabel[event.status]} />
        </div>

        <section className="mt-8 rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#172026]">
            QR Code e links
          </h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-lg border border-[#ddd5c7] bg-[#fbfaf7] p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="QR Code do evento"
                className="mx-auto h-44 w-44"
                src={qrCodeDataUrl}
              />
              <p className="mt-3 text-sm font-semibold text-[#172026]">
                Upload dos convidados
              </p>
            </div>
            <div className="grid content-start gap-4">
              <LinkRow label="Upload dos convidados" value={uploadUrl} />
              <LinkRow label="Telao" value={screenUrl} />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#172026]">
            Configuracoes do evento
          </h2>
          <form
            action={updateEventSettingsAction}
            className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]"
          >
            <input name="eventId" type="hidden" value={event.id} />
            <div>
              <div className="overflow-hidden rounded-lg border border-[#ddd5c7] bg-[#fbfaf7]">
                {event.invitationImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="aspect-[3/4] w-full object-contain"
                    src={event.invitationImageUrl}
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center p-6 text-center text-sm text-[#52616b]">
                    Nenhum convite configurado
                  </div>
                )}
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[#172026]">
                  Imagem do convite
                </span>
                <input
                  accept="image/*"
                  className="mt-2 block w-full rounded-md border border-dashed border-[#d7cfc1] bg-[#fbfaf7] p-3 text-sm text-[#52616b]"
                  name="invitationImage"
                  type="file"
                />
              </label>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-[#172026]">
                  Nome do evento
                </span>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                  defaultValue={event.name}
                  name="name"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#172026]">Data</span>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                  defaultValue={formattedEventDate}
                  name="eventDate"
                  type="date"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#172026]">
                    Cor principal
                  </span>
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                    defaultValue={event.primaryColor ?? "#9a5a44"}
                    name="primaryColor"
                    type="color"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[#172026]">
                    Cor secundaria
                  </span>
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                    defaultValue={event.secondaryColor ?? "#f6f4ef"}
                    name="secondaryColor"
                    type="color"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-[#172026]">
                  Texto de autorizacao
                </span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-md border border-[#d7cfc1] px-3 py-2 text-sm leading-6 outline-none focus:border-[#9a5a44]"
                  defaultValue={event.authorizationText}
                  name="authorizationText"
                  required
                />
              </label>

              <button
                className="h-10 rounded-md bg-[#172026] px-4 text-sm font-semibold text-white"
                type="submit"
              >
                Salvar configuracoes
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#172026]">Moderadores</h2>
          <form action={createModeratorAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input name="eventId" type="hidden" value={event.id} />
            <input
              className="h-10 flex-1 rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
              name="name"
              placeholder="Nome do moderador"
              required
            />
            <button
              className="h-10 rounded-md bg-[#172026] px-4 text-sm font-semibold text-white"
              type="submit"
            >
              Criar link
            </button>
          </form>

          {moderatorToken ? (
            <div className="mt-5 rounded-md border border-[#d7cfc1] bg-[#fbfaf7] p-4">
              <p className="text-sm font-semibold text-[#172026]">
                Link criado. Copie agora.
              </p>
              <p className="mt-1 text-xs leading-5 text-[#52616b]">
                Por seguranca, o token completo aparece apenas neste momento.
              </p>
              <p className="mt-3 break-all rounded-md bg-white p-3 text-sm text-[#52616b]">
                /moderate/{moderatorToken}
              </p>
            </div>
          ) : null}

          <div className="mt-6 divide-y divide-[#ede7dd]">
            {moderators.length === 0 ? (
              <p className="text-sm text-[#52616b]">
                Nenhum moderador criado para este evento.
              </p>
            ) : (
              moderators.map((moderator) => (
                <div
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  key={moderator.id}
                >
                  <div>
                    <p className="font-medium text-[#172026]">{moderator.name}</p>
                    <p className="text-sm text-[#52616b]">
                      Criado em {moderator.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-fit rounded-md bg-[#f6f4ef] px-3 py-1 text-sm text-[#52616b]">
                      {moderatorStatusLabel[moderator.status]}
                    </span>
                    {moderator.status !== ModeratorStatus.REVOKED ? (
                      <form action={revokeModeratorAction}>
                        <input name="eventId" type="hidden" value={event.id} />
                        <input
                          name="moderatorId"
                          type="hidden"
                          value={moderator.id}
                        />
                        <button
                          className="h-8 rounded-md border border-[#d7cfc1] px-3 text-xs font-semibold text-[#52616b]"
                          type="submit"
                        >
                          Revogar
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[#ddd5c7] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#52616b]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#172026]">{value}</p>
    </div>
  );
}

function LinkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f6f4ef] p-4">
      <p className="text-sm font-semibold text-[#172026]">{label}</p>
      <p className="mt-1 break-all text-sm text-[#52616b]">{value}</p>
    </div>
  );
}
