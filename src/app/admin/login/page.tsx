import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/auth-buttons";
import { authOptions } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  const isGoogleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  if (session?.user?.email) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#1D1108] px-6 py-12 text-[#1D1108]">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-sm flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-5xl italic leading-none text-[#D4562B]">
            revela
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#7A5B44]">
            gestão de eventos
          </p>
        </div>

        <div className="rounded-2xl bg-[#F4EDE1] p-8 shadow-2xl">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold italic text-[#1D1108]">
            Acesso restrito
          </p>
          <h1 className="sr-only">
            Acesse o Revela
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#8A6B55]">
            Use sua conta Google para criar eventos, gerar QR Codes e preparar a
            moderacao.
          </p>
          {!isGoogleConfigured ? (
            <div className="mt-6 rounded-lg border border-[rgba(212,86,43,0.2)] bg-[rgba(212,86,43,0.08)] p-4 text-sm leading-6 text-[#D4562B]">
              Login Google ainda nao configurado. Preencha
              <code className="mx-1 rounded bg-white px-1">GOOGLE_CLIENT_ID</code>
              e
              <code className="mx-1 rounded bg-white px-1">
                GOOGLE_CLIENT_SECRET
              </code>
              no arquivo <code className="rounded bg-white px-1">.env</code>.
            </div>
          ) : null}
          <div className="mt-8">
            <SignInButton />
          </div>
        </div>
        <p className="mt-6 text-center text-[10px] text-[#5A3D2B]">
          revela.gersonvan.com.br
        </p>
      </section>
    </main>
  );
}
