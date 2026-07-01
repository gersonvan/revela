"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/auth-buttons";

type AdminSidebarProps = {
  activeEventName?: string;
  activeEventSlug?: string;
  adminEmail?: string;
  pendingCount?: number;
};

export function AdminSidebar({
  activeEventName,
  activeEventSlug,
  adminEmail,
  pendingCount,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const adminInitial = adminEmail?.trim().charAt(0).toUpperCase() || "A";
  const adminName = adminEmail?.split("@")[0] || "Admin";
  const isEventDetailRoute =
    pathname?.startsWith("/admin/events/") && !pathname.endsWith("/new");

  return (
    <aside className="flex w-full flex-col bg-[#1D1108] text-[#F0DDD0] md:min-h-screen md:w-52 md:min-w-52">
      <div className="border-b border-white/5 px-4 py-4">
        <span className="font-[family-name:var(--font-display)] text-xl italic text-[#D4562B]">
          revela
        </span>
        <span className="mt-0.5 block text-[8px] uppercase tracking-widest text-[#7A5B44]">
          gestão de eventos
        </span>
      </div>

      {activeEventName ? (
        <div className="border-b border-white/5 px-4 py-3">
          <span className="text-[8px] uppercase tracking-widest text-[#7A5B44]">
            Evento ativo
          </span>
          <p className="mt-0.5 font-[family-name:var(--font-display)] text-sm leading-snug text-[#F0DDD0]">
            {activeEventName}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[10px] font-bold text-[#16A34A]">Ativo</span>
          </div>
        </div>
      ) : null}

      <nav className="flex-1 py-1.5">
        <SidebarLink
          active={pathname === "/admin"}
          href="/admin"
          icon="▦"
          label="Eventos"
        />

        {isEventDetailRoute ? (
          <>
            <SidebarLink
              active
              badge={pendingCount}
              href={pathname}
              icon="▣"
              label="Detalhe"
            />
            <SidebarLink
              active={false}
              href={`${pathname}#qr-code`}
              icon="▦"
              label="QR Code"
            />
            <SidebarLink
              active={false}
              href={activeEventSlug ? `/t/${activeEventSlug}` : pathname}
              icon="▭"
              label="Telão"
              target={activeEventSlug ? "_blank" : undefined}
            />
            <SidebarLink
              active={false}
              href={`${pathname}#configuracoes`}
              icon="⚙"
              label="Configurações"
            />
          </>
        ) : (
          <SidebarLink active={false} href="/admin" icon="⚙" label="Configurações" />
        )}
      </nav>

      <div className="flex items-center gap-2 border-t border-white/5 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4562B] to-[#8A3F25] text-xs font-bold text-white">
          {adminInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[#F0DDD0]">{adminName}</p>
          <div className="[&_button]:h-auto [&_button]:border-0 [&_button]:p-0 [&_button]:hover:bg-transparent [&_button]:hover:text-[#F0DDD0]">
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  active,
  badge,
  href,
  icon,
  label,
  target,
}: {
  active: boolean;
  badge?: number;
  href: string;
  icon: string;
  label: string;
  target?: "_blank";
}) {
  return (
    <Link
      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition ${
        active
          ? "border-l-[2.5px] border-[#D4562B] bg-[rgba(212,86,43,0.15)] font-bold text-[#F0DDD0]"
          : "border-l-[2.5px] border-transparent text-[#7A5B44] hover:text-[#F0DDD0]"
      }`}
      href={href}
      rel={target === "_blank" ? "noreferrer" : undefined}
      target={target}
    >
      <span className="w-4 text-center text-sm leading-none">{icon}</span>
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="ml-auto rounded-full bg-[rgba(212,86,43,0.2)] px-2 py-0.5 text-[9px] font-bold text-[#D4562B]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
