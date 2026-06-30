"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      className="inline-flex h-11 items-center justify-center rounded-md bg-[#172026] px-5 text-sm font-semibold text-white transition hover:bg-[#2a3740]"
      onClick={() => signIn("google", { callbackUrl: "/admin" })}
      type="button"
    >
      Entrar com Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md border border-[#d7cfc1] px-4 text-sm font-semibold text-[#52616b] transition hover:bg-[#f6f4ef]"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Sair
    </button>
  );
}
