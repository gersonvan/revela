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
    <main className="min-h-screen bg-[#f6f4ef] px-6 py-12 text-[#1f2933]">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="rounded-lg border border-[#ddd5c7] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5a44]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#172026]">
            Acesse o EventoOn
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#52616b]">
            Use sua conta Google para criar eventos, gerar QR Codes e preparar a
            moderacao.
          </p>
          {!isGoogleConfigured ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
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
      </section>
    </main>
  );
}
