import Link from "next/link";
import { createEventAction } from "@/app/admin/events/actions";
import { requireAdmin } from "@/lib/admin";

const defaultAuthorizationText =
  "Ao enviar, voce autoriza que esta foto apareca no telao da festa apos moderacao. Envie apenas fotos que voce se sente confortavel em compartilhar neste evento.";

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-semibold text-[#9a5a44]" href="/admin">
          Voltar para eventos
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-[#172026]">
          Novo evento
        </h1>
        <form
          action={createEventAction}
          className="mt-8 space-y-6 rounded-lg border border-[#ddd5c7] bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-semibold text-[#172026]">
              Nome do evento
            </span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
              name="name"
              placeholder="Aniversario da..."
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#172026]">Data</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
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
                className="mt-2 h-11 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                defaultValue="#9a5a44"
                name="primaryColor"
                type="color"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172026]">
                Cor secundaria
              </span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#d7cfc1] px-3 text-sm outline-none focus:border-[#9a5a44]"
                defaultValue="#f6f4ef"
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
              defaultValue={defaultAuthorizationText}
              name="authorizationText"
              required
            />
          </label>

          <div className="flex justify-end gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#d7cfc1] px-4 text-sm font-semibold text-[#52616b]"
              href="/admin"
            >
              Cancelar
            </Link>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#172026] px-4 text-sm font-semibold text-white transition hover:bg-[#2a3740]"
              type="submit"
            >
              Criar evento
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
