"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#E8DDD1] bg-white px-5 text-sm font-bold text-[#1D1108] shadow-sm transition hover:bg-[#FBF5EE]"
      onClick={() => signIn("google", { callbackUrl: "/admin" })}
      type="button"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4EDE1] text-xs font-bold text-[#D4562B]">
        G
      </span>
      Entrar com Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E8DDD1] px-4 text-sm font-semibold text-[#8A6B55] transition hover:bg-[#F4EDE1]"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Sair
    </button>
  );
}
