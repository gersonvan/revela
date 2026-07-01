import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus, ModeratorStatus } from "@/generated/prisma/enums";
import {
  createModeratorAction,
  revokeModeratorAction,
  updateEventSettingsAction,
  updateEventStatusAction,
} from "@/app/admin/events/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

const eventStatusClass: Record<EventStatus, string> = {
  DRAFT: "text-[#8A6B55]",
  ACTIVE: "text-[#16A34A]",
  CLOSED: "text-[#8A6B55]",
};

const moderatorStatusClass: Record<ModeratorStatus, string> = {
  CREATED: "bg-[#F4EDE1] text-[#8A6B55]",
  USED: "bg-[rgba(22,163,74,0.10)] text-[#16A34A]",
  REVOKED: "bg-[rgba(220,38,38,0.08)] text-[#DC2626]",
};

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    inviteStatus?: string;
    moderatorEmail?: string;
    moderatorToken?: string;
  }>;
};

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const admin = await requireAdmin();
  const { eventId } = await params;
  const { inviteStatus, moderatorEmail, moderatorToken } = await searchParams;
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
  const shortScreenPath = `/t/${event.publicSlug}`;
  const uploadUrl = `${baseUrl}${uploadPath}`;
  const screenUrl = `${baseUrl}${shortScreenPath}`;
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
  const pendingCount = photoCountByStatus.get("PENDING") ?? 0;
  const createdModeratorUrl = moderatorToken
    ? `${baseUrl}/moderate/${moderatorToken}`
    : "";
  const moderatorInviteMailto = createdModeratorUrl
    ? `mailto:?subject=${encodeURIComponent(`Convite para moderar ${event.name}`)}&body=${encodeURIComponent(`Olá! Use este link para moderar as fotos do evento ${event.name}:

${createdModeratorUrl}`)}`
    : "";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar
        activeEventName={event.name}
        activeEventSlug={event.publicSlug}
        adminEmail={admin.email}
        pendingCount={pendingCount}
      />
      <main className="flex-1 bg-[#FBF5EE] px-6 py-8 text-[#1D1108] md:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#E8DDD1] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="text-xs font-bold uppercase tracking-[0.16em] text-[#D4562B]" href="/admin">
              ← Eventos · <span className={eventStatusClass[event.status]}>{statusLabel[event.status]}</span>
            </Link>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[#1D1108]">
              {event.name}
            </h1>
            <p className="mt-2 text-sm text-[#8A6B55]">
              Criado em {event.createdAt.toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center rounded-lg border border-[#E8DDD1] px-4 text-sm font-semibold text-[#8A6B55]"
              href={`/admin/events/${event.id}/export`}
            >
              JSON
            </Link>
            <Link
              className="inline-flex h-10 items-center rounded-lg border border-[#E8DDD1] px-4 text-sm font-semibold text-[#8A6B55]"
              href={`/admin/events/${event.id}/export-zip`}
            >
              ZIP
            </Link>
            {event.status !== EventStatus.ACTIVE ? (
              <form action={updateEventStatusAction}>
                <input name="eventId" type="hidden" value={event.id} />
                <input name="status" type="hidden" value={EventStatus.ACTIVE} />
                <button
                  className="h-10 rounded-lg border border-[#E8DDD1] px-4 text-sm font-semibold text-[#1D1108]"
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
                  className="h-10 rounded-lg bg-[#D4562B] px-4 text-sm font-bold text-white"
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
          <Metric label="Pendentes" tone="pending" value={pendingCount} />
          <Metric label="Aprovadas" tone="approved" value={photoCountByStatus.get("APPROVED") ?? 0} />
          <Metric label="Rejeitadas" tone="rejected" value={photoCountByStatus.get("REJECTED") ?? 0} />
          <Metric
            label="Moderadores"
            value={`${moderatorCountByStatus.get("USED") ?? 0}/${event._count.moderators}`}
          />
          <Metric label="Status" value={statusLabel[event.status]} />
        </div>

        <section className="mt-8 scroll-mt-6 rounded-xl border border-[#E8DDD1] bg-white p-6 shadow-sm" id="qr-code"> <h2 className="text-sm font-bold text-[#1D1108]"> QR Code e links </h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="QR Code do evento"
                className="mx-auto h-44 w-44"
                src={qrCodeDataUrl}
              />
              <p className="mt-3 text-sm font-bold text-[#1D1108]">
                Upload dos convidados
              </p>
            </div>
            <div className="grid content-start gap-4">
              <LinkRow label="Upload dos convidados" value={uploadUrl} />
              <LinkRow label="Telão" value={screenUrl} />
            </div>
          </div>
        </section>

        <section className="mt-8 scroll-mt-6 rounded-xl border border-[#E8DDD1] bg-white p-6 shadow-sm" id="configuracoes"> <h2 className="text-sm font-bold text-[#1D1108]"> Configurações do evento </h2>
          <form
            action={updateEventSettingsAction}
            className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]"
          >
            <input name="eventId" type="hidden" value={event.id} />
            <div>
              <div className="overflow-hidden rounded-xl border border-[#E8DDD1] bg-[#F4EDE1]">
                {event.invitationImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="aspect-[3/4] w-full object-contain"
                    src={event.invitationImageUrl}
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center p-6 text-center text-sm text-[#8A6B55]">
                    Nenhum convite configurado
                  </div>
                )}
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                  Imagem do convite
                </span>
                <input
                  accept="image/*"
                  className="block w-full rounded-xl border border-dashed border-[#E8DDD1] bg-[#F4EDE1] p-3 text-sm text-[#8A6B55]"
                  name="invitationImage"
                  type="file"
                />
              </label>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                  Nome do evento
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]"
                  defaultValue={event.name}
                  name="name"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">Data</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]"
                  defaultValue={formattedEventDate}
                  name="eventDate"
                  type="date"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                    Cor principal
                  </span>
                  <input
                    className="h-10 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm outline-none focus:border-[#D4562B]"
                    defaultValue={event.primaryColor ?? "#D4562B"}
                    name="primaryColor"
                    type="color"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                    Cor secundaria
                  </span>
                  <input
                    className="h-10 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm outline-none focus:border-[#D4562B]"
                    defaultValue={event.secondaryColor ?? "#FBF5EE"}
                    name="secondaryColor"
                    type="color"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                  Texto de autorizacao
                </span>
                <textarea
                  className="min-h-28 w-full resize-none rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 py-2 text-sm leading-6 text-[#1D1108] outline-none focus:border-[#D4562B]"
                  defaultValue={event.authorizationText}
                  name="authorizationText"
                  required
                />
              </label>

              <button
                className="h-10 rounded-lg bg-[#1D1108] px-4 text-sm font-bold text-white"
                type="submit"
              >
                Salvar configurações
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#1D1108]">Moderadores</h2>
          <form action={createModeratorAction} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"> <input name="eventId" type="hidden" value={event.id} /> <input className="h-10 rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]" name="name" placeholder="Nome do moderador" required /> <input className="h-10 rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B]" name="email" placeholder="E-mail do moderador (opcional)" type="email" /> <button className="h-10 rounded-lg bg-[#1D1108] px-4 text-sm font-bold text-white" type="submit" > Criar e convidar </button> </form>

          {moderatorToken ? (
            <div className="mt-5 rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] p-4">
              <p className="text-sm font-bold text-[#1D1108]">
                Link criado. Copie agora.
              </p>
              <p className="mt-1 text-xs leading-5 text-[#8A6B55]"> Por segurança, o token completo aparece apenas neste momento. </p> {inviteStatus === "sent" ? <p className="mt-3 rounded-lg border border-[#16A34A]/20 bg-[#16A34A]/10 p-3 text-sm font-bold text-[#16A34A]"> Convite enviado para {moderatorEmail}. </p> : null} {inviteStatus === "not_configured" ? <p className="mt-3 rounded-lg border border-[#D4562B]/20 bg-[#D4562B]/10 p-3 text-sm font-bold text-[#D4562B]"> Link criado. Configure RESEND_API_KEY e EMAIL_FROM para envio automático. </p> : null} {inviteStatus === "failed" ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"> Link criado, mas o envio por e-mail falhou. Use o link abaixo. </p> : null} <p className="mt-3 break-all rounded-lg bg-white p-3 text-sm text-[#8A6B55]"> {createdModeratorUrl} </p> <a className="mt-3 inline-flex h-10 items-center rounded-lg bg-[#D4562B] px-4 text-sm font-bold text-white" href={moderatorInviteMailto}> Preparar e-mail manual </a>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {moderators.length === 0 ? (
              <p className="text-sm text-[#8A6B55]">
                Nenhum moderador criado para este evento.
              </p>
            ) : (
              moderators.map((moderator) => (
                <div
                  className="flex flex-col gap-3 rounded-xl border border-[#E8DDD1] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={moderator.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#D4562B] to-[#F97316] text-xs font-bold text-white">
                      {moderator.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1D1108]">{moderator.name}</p>
                      <p className="text-[10px] text-[#8A6B55]">
                        Criado em {moderator.createdAt.toLocaleDateString("pt-BR")}
                      </p> {moderator.email ? ( <p className="text-[10px] text-[#8A6B55]">{moderator.email}</p> ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${moderatorStatusClass[moderator.status]}`}>
                      {moderatorStatusLabel[moderator.status]}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        moderator.status === ModeratorStatus.USED
                          ? "bg-[#16A34A]"
                          : "bg-[#D4562B]"
                      }`}
                    />
                    {moderator.status !== ModeratorStatus.REVOKED ? (
                      <form action={revokeModeratorAction}>
                        <input name="eventId" type="hidden" value={event.id} />
                        <input
                          name="moderatorId"
                          type="hidden"
                          value={moderator.id}
                        />
                        <button
                          className="h-8 rounded-lg border border-[#E8DDD1] px-3 text-xs font-semibold text-[#8A6B55]"
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
    </div>
  );
}

function Metric({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "approved" | "default" | "pending" | "rejected";
  value: number | string;
}) {
  const toneClass = {
    approved: "border-[rgba(22,163,74,0.18)] text-[#16A34A]",
    default: "border-[#E8DDD1] text-[#1D1108]",
    pending: "border-[rgba(212,86,43,0.2)] text-[#D4562B]",
    rejected: "border-[rgba(220,38,38,0.14)] text-[#DC2626]",
  }[tone];

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${toneClass}`}>
      <p className="text-[9px] uppercase tracking-wide text-[#8A6B55]">{label}</p>
      <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-none">
        {value}
      </p>
    </div>
  );
}

function LinkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F4EDE1] p-4">
      <p className="text-sm font-bold text-[#1D1108]">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-[#D4562B]">{value}</p>
    </div>
  );
}
