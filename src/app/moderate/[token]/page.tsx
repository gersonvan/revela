import Link from "next/link";
import { PhotoStatus } from "@/generated/prisma/enums";
import {
  activateModeratorAction,
  moderatePhotoAction,
} from "@/app/moderate/[token]/actions";
import { ModerationAutoRefresh } from "@/components/moderation/moderation-auto-refresh";
import { getModeratorAccess } from "@/lib/moderation/access";
import { prisma } from "@/lib/prisma";

const tabStatus: Record<string, PhotoStatus> = {
  approved: PhotoStatus.APPROVED,
  pending: PhotoStatus.PENDING,
  rejected: PhotoStatus.REJECTED,
};

const tabLabel: Record<string, string> = {
  approved: "Aprovadas",
  pending: "Pendentes",
  rejected: "Rejeitadas",
};

type ModerationPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function ModerationPage({
  params,
  searchParams,
}: ModerationPageProps) {
  const { token } = await params;
  const { tab = "pending" } = await searchParams;
  const currentTab = tabStatus[tab] ? tab : "pending";
  const access = await getModeratorAccess(token);

  if (access.status === "invalid") {
    return <ModerationState title="Link invalido" message="Este link nao existe ou foi revogado." />;
  }

  if (access.status === "device_mismatch") {
    return (
      <ModerationState
        title="Link ja usado"
        message="Este link ja foi ativado em outro dispositivo."
      />
    );
  }

  if (access.status === "activation_required" && access.moderator) {
    return (
      <main className="min-h-screen bg-[#FBF5EE] px-5 py-8 text-[#1D1108]">
        <section className="mx-auto max-w-md rounded-2xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4562B]">
            Moderacao
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[#1D1108]">
            Ativar acesso
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8A6B55]">
            Este link sera vinculado a este dispositivo para moderar o evento{" "}
            <strong className="font-[family-name:var(--font-display)] text-lg italic text-[#D4562B]">
              {access.moderator.event.name}
            </strong>
          </p>
          <div className="mt-5 rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] px-4 py-3 text-center">
            <p className="text-[9px] text-[#8A6B55]">Voce e</p>
            <p className="mt-1 text-sm font-bold text-[#1D1108]">
              {access.moderator.name}
            </p>
          </div>
          <form action={activateModeratorAction} className="mt-6">
            <input name="token" type="hidden" value={token} />
            <button
              className="h-11 w-full rounded-xl bg-[#D4562B] px-4 text-sm font-bold text-white"
              type="submit"
            >
              Ativar neste dispositivo
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (access.status !== "authorized" || !access.moderator) {
    return <ModerationState title="Acesso indisponivel" message="Nao foi possivel validar este acesso." />;
  }

  const photos = await prisma.photo.findMany({
    where: {
      eventId: access.moderator.eventId,
      status: tabStatus[currentTab],
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });
  const counts = await prisma.photo.groupBy({
    by: ["status"],
    where: {
      eventId: access.moderator.eventId,
    },
    _count: {
      status: true,
    },
  });
  const countByStatus = new Map(
    counts.map((item) => [item.status, item._count.status]),
  );
  const latestPending = await prisma.photo.findFirst({
    where: {
      eventId: access.moderator.eventId,
      status: PhotoStatus.PENDING,
    },
    orderBy: { uploadedAt: "desc" },
    select: { id: true },
  });

  return (
    <main className="min-h-screen bg-[#FBF5EE] px-4 py-6 text-[#1D1108]">
      <section className="mx-auto max-w-5xl">
        <header className="border-b border-[#E8DDD1] pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4562B]">
            Moderacao
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[#1D1108]">
            {access.moderator.event.name}
          </h1>
          <p className="mt-2 text-sm text-[#8A6B55]">
            Moderador: {access.moderator.name}
          </p>
          <ModerationAutoRefresh
            initialLatestPendingId={latestPending?.id ?? null}
            token={token}
          />
        </header>

        <nav className="mt-5 grid grid-cols-3 gap-2">
          {Object.entries(tabStatus).map(([tabKey, status]) => (
            <Link
              className={
                currentTab === tabKey
                  ? "rounded-lg bg-[#1D1108] px-3 py-3 text-center text-sm font-bold text-white"
                  : "rounded-lg border border-[#E8DDD1] bg-white px-3 py-3 text-center text-sm font-semibold text-[#8A6B55]"
              }
              href={`/moderate/${token}?tab=${tabKey}`}
              key={tabKey}
            >
              {tabLabel[tabKey]}{" "}
              <span
                className={
                  tabKey === "pending" && (countByStatus.get(status) ?? 0) > 0
                    ? "ml-1.5 rounded-full bg-[rgba(212,86,43,0.12)] px-2 text-[10px] font-bold text-[#D4562B]"
                    : ""
                }
              >
                ({countByStatus.get(status) ?? 0})
              </span>
            </Link>
          ))}
        </nav>

        <section className="mt-6">
          {photos.length === 0 ? (
            <div className="rounded-2xl border border-[#E8DDD1] bg-white p-8 shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold italic text-[#1D1108]">
                Nenhuma foto em {tabLabel[currentTab].toLowerCase()}
              </h2>
              <p className="mt-2 text-sm text-[#8A6B55]">
                Novas fotos aparecerao aqui conforme forem enviadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <PhotoCard
                  currentStatus={tabStatus[currentTab]}
                  key={photo.id}
                  photo={{
                    guestName: photo.guestName,
                    id: photo.id,
                    imageUrl: photo.optimizedFileUrl ?? photo.originalFileUrl,
                    message: photo.message,
                    uploadedAt: photo.uploadedAt,
                  }}
                  token={token}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function PhotoCard({
  currentStatus,
  photo,
  token,
}: {
  currentStatus: PhotoStatus;
  photo: {
    guestName: string;
    id: string;
    imageUrl: string;
    message: string | null;
    uploadedAt: Date;
  };
  token: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="aspect-[4/3] w-full object-cover" src={photo.imageUrl} />
      <div className="space-y-3 p-4">
        <div>
          <h2 className="text-sm font-bold text-[#1D1108]">{photo.guestName}</h2>
          <p className="mt-0.5 text-[10px] text-[#8A6B55]">
            {photo.uploadedAt.toLocaleString("pt-BR")}
          </p>
        </div>
        {photo.message ? (
          <p className="text-sm italic leading-5 text-[#8A6B55]">
            &ldquo;{photo.message}&rdquo;
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {currentStatus !== PhotoStatus.APPROVED ? (
            <form action={moderatePhotoAction} className="flex-1">
              <input name="token" type="hidden" value={token} />
              <input name="photoId" type="hidden" value={photo.id} />
              <input name="nextStatus" type="hidden" value={PhotoStatus.APPROVED} />
              <button
                className="h-10 w-full rounded-xl bg-[#16A34A] px-3 text-sm font-bold text-white"
                type="submit"
              >
                Aprovar
              </button>
            </form>
          ) : null}
          {currentStatus !== PhotoStatus.REJECTED ? (
            <form action={moderatePhotoAction} className="flex-1">
              <input name="token" type="hidden" value={token} />
              <input name="photoId" type="hidden" value={photo.id} />
              <input name="nextStatus" type="hidden" value={PhotoStatus.REJECTED} />
              <button
                className="h-10 w-full rounded-xl border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.06)] px-3 text-sm font-bold text-[#DC2626]"
                type="submit"
              >
                Rejeitar
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ModerationState({ message, title }: { message: string; title: string }) {
  return (
    <main className="min-h-screen bg-[#FBF5EE] px-5 py-8 text-[#1D1108]">
      <section className="mx-auto max-w-md rounded-2xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4562B]">
          Moderacao
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[#1D1108]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#8A6B55]">{message}</p>
      </section>
    </main>
  );
}
