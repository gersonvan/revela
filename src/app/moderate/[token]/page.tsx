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
      <main className="min-h-screen bg-[#f6f4ef] px-5 py-8 text-[#1f2933]">
        <section className="mx-auto max-w-md rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
            Moderacao
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[#172026]">
            Ativar acesso
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#52616b]">
            Este link sera vinculado a este dispositivo para moderar o evento{" "}
            <strong>{access.moderator.event.name}</strong>.
          </p>
          <form action={activateModeratorAction} className="mt-6">
            <input name="token" type="hidden" value={token} />
            <button
              className="h-11 w-full rounded-md bg-[#172026] px-4 text-sm font-semibold text-white"
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
    <main className="min-h-screen bg-[#f6f4ef] px-4 py-6 text-[#1f2933]">
      <section className="mx-auto max-w-5xl">
        <header className="border-b border-[#ddd5c7] pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
            Moderacao
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#172026]">
            {access.moderator.event.name}
          </h1>
          <p className="mt-2 text-sm text-[#52616b]">
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
                  ? "rounded-md bg-[#172026] px-3 py-3 text-center text-sm font-semibold text-white"
                  : "rounded-md border border-[#d7cfc1] bg-white px-3 py-3 text-center text-sm font-semibold text-[#52616b]"
              }
              href={`/moderate/${token}?tab=${tabKey}`}
              key={tabKey}
            >
              {tabLabel[tabKey]} ({countByStatus.get(status) ?? 0})
            </Link>
          ))}
        </nav>

        <section className="mt-6">
          {photos.length === 0 ? (
            <div className="rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#172026]">
                Nenhuma foto em {tabLabel[currentTab].toLowerCase()}
              </h2>
              <p className="mt-2 text-sm text-[#52616b]">
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
    <article className="overflow-hidden rounded-lg border border-[#ddd5c7] bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="aspect-[4/3] w-full object-cover" src={photo.imageUrl} />
      <div className="space-y-3 p-4">
        <div>
          <h2 className="font-semibold text-[#172026]">{photo.guestName}</h2>
          <p className="text-xs text-[#52616b]">
            {photo.uploadedAt.toLocaleString("pt-BR")}
          </p>
        </div>
        {photo.message ? (
          <p className="text-sm leading-6 text-[#52616b]">{photo.message}</p>
        ) : null}
        <div className="flex gap-2">
          {currentStatus !== PhotoStatus.APPROVED ? (
            <form action={moderatePhotoAction} className="flex-1">
              <input name="token" type="hidden" value={token} />
              <input name="photoId" type="hidden" value={photo.id} />
              <input name="nextStatus" type="hidden" value={PhotoStatus.APPROVED} />
              <button
                className="h-10 w-full rounded-md bg-[#172026] px-3 text-sm font-semibold text-white"
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
                className="h-10 w-full rounded-md border border-[#d7cfc1] px-3 text-sm font-semibold text-[#52616b]"
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
    <main className="min-h-screen bg-[#f6f4ef] px-5 py-8 text-[#1f2933]">
      <section className="mx-auto max-w-md rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
          Moderacao
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[#172026]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#52616b]">{message}</p>
      </section>
    </main>
  );
}
