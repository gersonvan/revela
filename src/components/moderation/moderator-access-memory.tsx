"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "eventoon:last-moderator-access";

type StoredModeratorAccess = {
  eventName: string;
  moderatorName: string;
  savedAt: string;
  url: string;
};

export function RememberModeratorAccess({
  eventName,
  moderatorName,
  token,
}: {
  eventName: string;
  moderatorName: string;
  token: string;
}) {
  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        eventName,
        moderatorName,
        savedAt: new Date().toISOString(),
        url: `/moderate/${token}`,
      } satisfies StoredModeratorAccess),
    );
  }, [eventName, moderatorName, token]);

  return null;
}

export function RestoreModeratorAccess() {
  const [access, setAccess] = useState<StoredModeratorAccess | null>(null);

  useEffect(() => {
    window.queueMicrotask(() => {
      const storedAccess = window.localStorage.getItem(STORAGE_KEY);

      if (!storedAccess) {
        return;
      }

      try {
        setAccess(JSON.parse(storedAccess) as StoredModeratorAccess);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#FBF5EE] px-5 py-8 text-[#1D1108]">
      <section className="mx-auto max-w-md rounded-2xl border border-[#E8DDD1] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4562B]">
          Moderação
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[#1D1108]">
          Voltar para moderação
        </h1>
        {access ? (
          <>
            <p className="mt-3 text-sm leading-6 text-[#8A6B55]">
              Encontramos um acesso salvo neste navegador para o evento{" "}
              <strong className="text-[#1D1108]">{access.eventName}</strong>.
            </p>
            <div className="mt-5 rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A6B55]">
                Moderador
              </p>
              <p className="mt-1 text-sm font-bold text-[#1D1108]">
                {access.moderatorName}
              </p>
            </div>
            <Link
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D4562B] px-4 text-sm font-bold text-white"
              href={access.url}
            >
              Abrir moderação
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[#8A6B55]">
              Nenhum acesso de moderador foi encontrado neste navegador. Abra o
              link recebido por e-mail ou peça um novo convite ao administrador.
            </p>
            <p className="mt-4 rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] p-3 text-xs leading-5 text-[#8A6B55]">
              Depois do primeiro acesso, o Revela salva um atalho local neste
              navegador para facilitar o retorno.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
