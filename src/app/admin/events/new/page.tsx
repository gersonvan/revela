import Link from "next/link";
import { createEventAction } from "@/app/admin/events/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/admin";

const defaultAuthorizationText =
  "Ao enviar, você autoriza que está foto apareça no telão da festá após moderação. Envie apenas fotos que você se sente confortável em compartilhar neste evento.";

export default async function NewEventPage() {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar adminEmail={admin.email} />
      <main className="flex-1 bg-[#FBF5EE] px-6 py-8 text-[#1D1108] md:px-8">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-[#D4562B]" href="/admin">
          Voltar para eventos
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[#1D1108]">
          Novo evento
        </h1>
        <form
          action={createEventAction}
          className="mt-8 space-y-6 rounded-xl border border-[#E8DDD1] bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
              Nome do evento
            </span>
            <input
              className="h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B] focus:ring-1 focus:ring-[#D4562B]"
              name="name"
              placeholder="Aniversario da..."
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">Data</span>
            <input
              className="h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B] focus:ring-1 focus:ring-[#D4562B]"
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
                className="h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm outline-none focus:border-[#D4562B]"
                defaultValue="#D4562B"
                name="primaryColor"
                type="color"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#8A6B55]">
                Cor secundaria
              </span>
              <input
                className="h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm outline-none focus:border-[#D4562B]"
                defaultValue="#FBF5EE"
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
              className="min-h-28 w-full resize-none rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 py-2 text-sm leading-6 text-[#1D1108] outline-none focus:border-[#D4562B] focus:ring-1 focus:ring-[#D4562B]"
              defaultValue={defaultAuthorizationText}
              name="authorizationText"
              required
            />
          </label>

          <div className="flex justify-end gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E8DDD1] px-5 text-sm font-semibold text-[#8A6B55]"
              href="/admin"
            >
              Cancelar
            </Link>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#D4562B] px-6 text-sm font-bold text-white transition hover:bg-[#BA4620]"
              type="submit"
            >
              Criar evento
            </button>
          </div>
        </form>
      </section>
      </main>
    </div>
  );
}
