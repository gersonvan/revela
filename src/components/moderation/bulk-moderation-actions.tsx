"use client";

import { moderatePendingPhotosAction } from "@/app/moderate/[token]/actions";

type BulkModerationActionsProps = {
  pendingCount: number;
  token: string;
};

export function BulkModerationActions({
  pendingCount,
  token,
}: BulkModerationActionsProps) {
  if (pendingCount === 0) {
    return null;
  }

  function confirmBulkAction(nextStatus: "APPROVED" | "REJECTED") {
    const actionLabel = nextStatus === "APPROVED" ? "aprovar" : "reprovar";
    const photoLabel = pendingCount === 1 ? "foto pendente" : "fotos pendentes";

    return window.confirm(
      `Confirmar ${actionLabel} ${pendingCount} ${photoLabel}? Essa ação não altera fotos já aprovadas ou rejeitadas.`,
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#E8DDD1] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#1D1108]">
            Ações rápidas de moderação
          </h2>
          <p className="mt-1 text-sm text-[#8A6B55]">
            {pendingCount} {pendingCount === 1 ? "foto pendente" : "fotos pendentes"}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#8A6B55]">
            As ações em lote pedem confirmação e afetam somente fotos pendentes.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <form
            action={moderatePendingPhotosAction}
            onSubmit={(event) => {
              if (!confirmBulkAction("APPROVED")) {
                event.preventDefault();
              }
            }}
          >
            <input name="token" type="hidden" value={token} />
            <input name="nextStatus" type="hidden" value="APPROVED" />
            <button
              className="h-12 w-full rounded-xl bg-[#16A34A] px-4 text-sm font-bold text-white sm:w-auto"
              type="submit"
            >
              Aprovar todas
            </button>
          </form>
          <form
            action={moderatePendingPhotosAction}
            onSubmit={(event) => {
              if (!confirmBulkAction("REJECTED")) {
                event.preventDefault();
              }
            }}
          >
            <input name="token" type="hidden" value={token} />
            <input name="nextStatus" type="hidden" value="REJECTED" />
            <button
              className="h-12 w-full rounded-xl border border-[rgba(220,38,38,0.35)] bg-white px-4 text-sm font-bold text-[#DC2626] sm:w-auto"
              type="submit"
            >
              Reprovar todas
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
