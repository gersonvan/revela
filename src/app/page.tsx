"use client";

import Link from "next/link";
import { useState } from "react";

type PlanAudience = "business" | "party";

const partyPlans = [
  {
    badge: "Pacote único",
    cta: "Criar evento",
    features: [
      "Até 300 fotos aprovadas",
      "QR Code exclusivo e telão ao vivo",
      "Moderação manual incluída",
      "Acesso e download por 15 dias",
    ],
    highlighted: false,
    name: "Essencial",
    price: "R$149",
    suffix: "por evento",
  },
  {
    badge: "Mais escolhido",
    cta: "Criar evento completo",
    features: [
      "Fotos ilimitadas",
      "Telão ao vivo com moderação em tempo real",
      "Acesso e download por 60 dias",
      "Suporte prioritário no dia do evento",
    ],
    highlighted: true,
    name: "Completo",
    price: "R$249",
    suffix: "por evento",
  },
  {
    badge: "Memória completa",
    cta: "Criar memória",
    features: [
      "Tudo do Completo",
      "Acesso e download vitalício",
      "Álbum digital em alta resolução",
      "Vídeo-resumo automático do evento",
    ],
    highlighted: false,
    name: "Memória Eterna",
    price: "R$399",
    suffix: "por evento",
  },
];

const businessPlans = [
  {
    badge: "Primeiros eventos",
    cta: "Começar para empresa",
    features: [
      "Até 3 eventos por mês",
      "Marca própria no QR Code e telão",
      "Painel único para gerenciar eventos",
      "Download organizado por evento",
    ],
    highlighted: false,
    name: "Starter",
    price: "R$179",
    suffix: "por mês",
  },
  {
    badge: "Mais popular",
    cta: "Falar sobre o Profissional",
    features: [
      "Até 10 eventos por mês",
      "Cobrança de liberação de fotos direto ao cliente final",
      "Relatórios de faturamento por evento",
      "Marca própria e domínio personalizado",
    ],
    highlighted: true,
    name: "Profissional",
    price: "R$449",
    suffix: "por mês",
  },
  {
    badge: "Operação avançada",
    cta: "Consultar Enterprise",
    features: [
      "Eventos ilimitados",
      "Múltiplos usuários e moderadores",
      "API e integrações",
      "Gerente de conta dedicado",
    ],
    highlighted: false,
    name: "Enterprise",
    price: "Sob consulta",
    suffix: "",
  },
];

const celebrations = [
  {
    category: "Cerimônia",
    color: "from-[#D4A875] to-[#845028]",
    copy: "Reúna os registros de todos os convidados em um feed ao vivo exibido durante a recepção.",
    title: "Casamentos",
  },
  {
    category: "Aniversário",
    color: "from-[#D4562B] to-[#8E2D0E]",
    copy: "Convidados participam ativamente, e a festa ganha vida no telão com as fotos de quem estava lá.",
    title: "Festas de aniversário",
  },
  {
    category: "Festa infantil",
    color: "from-[#E8B040] to-[#B86818]",
    copy: "Moderação manual garante que só as melhores fotos apareçam, com total segurança.",
    title: "Festas infantis",
  },
  {
    category: "Corporativo",
    color: "from-[#4A8090] to-[#2C5060]",
    copy: "Confraternizações e convenções que criam pertencimento e engajam toda a equipe.",
    title: "Eventos corporativos",
  },
];

const polaroids = [
  ["Ana & Pedro · Casamento", "h-52 sm:h-[220px]", "from-[#D4A875] to-[#845028]", "-rotate-3"],
  ["Beatriz · 30 anos", "h-56 sm:h-[250px]", "from-[#E8B040] to-[#B86818]", "rotate-3 translate-y-3"],
  ["Miguel · 5 anos", "h-60 sm:h-[280px]", "from-[#D4562B] to-[#8E2D0E]", "-rotate-1"],
  ["Equipe Altera", "h-52 sm:h-[230px]", "from-[#8E9B8A] to-[#4A5A46]", "rotate-3 translate-y-4"],
  ["Bodas de Prata", "h-52 sm:h-[218px]", "from-[#C4889A] to-[#7A4055]", "-rotate-2"],
];

export default function Home() {
  const [audience, setAudience] = useState<PlanAudience>("party");
  const plans = audience === "party" ? partyPlans : businessPlans;

  return (
    <main className="min-h-screen bg-[#FBF5EE] text-[#1D1108]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Plans audience={audience} plans={plans} setAudience={setAudience} />
      <Celebrations />
      <QuoteCta />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4 sm:px-10 lg:px-[72px] lg:py-5">
      <Link
        className="font-[family-name:var(--font-display)] text-[26px] italic text-[#D4562B]"
        href="/"
      >
        revela
      </Link>
      <div className="flex items-center gap-4 sm:gap-7">
        <a className="hidden text-[13px] font-medium text-[#8A6B55] sm:inline" href="#como-funciona">
          Como funciona
        </a>
        <a className="hidden text-[13px] font-medium text-[#8A6B55] sm:inline" href="#planos">
          Planos
        </a>
        <Link className="hidden text-[13px] font-medium text-[#8A6B55] sm:inline" href="/admin/login">
          Entrar
        </Link>
        <Link
          className="rounded-lg bg-[#D4562B] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#BA4620]"
          href="/admin/login"
        >
          Criar evento
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-16 sm:px-10 lg:px-[72px] lg:pt-20">
      <div className="pointer-events-none absolute right-[-80px] top-[-120px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,86,43,0.06)_0%,transparent_70%)]" />
      <div className="relative z-10 mx-auto max-w-[820px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(212,86,43,0.18)] bg-[rgba(212,86,43,0.08)] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4562B]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D4562B]">
            Para uma festa ou para todos os eventos que você organiza
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[44px] font-semibold italic leading-none text-[#1D1108] text-balance sm:text-6xl lg:text-[80px]">
          As melhores fotos da festa não estão só no celular do fotógrafo.
        </h1>
        <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-7 text-[#8A6B55] sm:text-lg sm:leading-8">
          Com o revela, todos os seus convidados enviam fotos pelo celular via QR
          Code. Você modera. O telão exibe ao vivo, para uma festa única ou para
          todos os eventos da sua empresa.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#D4562B] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#BA4620]"
            href="/admin/login"
          >
            Criar meu evento <span aria-hidden>→</span>
          </Link>
          <a
            className="inline-flex items-center justify-center rounded-[10px] border border-[rgba(29,17,8,0.16)] px-6 py-3.5 text-sm font-semibold text-[#1D1108]"
            href="#planos"
          >
            Ver planos
          </a>
        </div>
      </div>

      <div className="relative z-10 -mx-8 mt-16 flex items-end justify-center gap-4 overflow-hidden px-8 pb-10 sm:mx-0 sm:gap-5 sm:overflow-visible">
        {polaroids.map(([caption, height, gradient, rotation], index) => (
          <div
            className={`w-[156px] shrink-0 bg-white p-2.5 pb-7 shadow-[0_8px_32px_rgba(0,0,0,0.14)] sm:w-[200px] ${
              index > 2 ? "hidden sm:block" : ""
            } ${rotation}`}
            key={caption}
          >
            <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${height}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_25%,rgba(255,255,255,0.2)_0%,transparent_55%)]" />
            </div>
            <p className="mt-2 text-center text-[10px] italic text-[#8A6B55]">{caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white px-5 py-20 sm:px-10 lg:px-[72px] lg:py-24" id="como-funciona">
      <SectionHeader label="Simples assim" title="Como funciona" />
      <div className="mx-auto mt-14 grid max-w-6xl items-center gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
        <div className="grid gap-4 lg:block">
          <Step
            copy="Configure em minutos. Um QR Code exclusivo é gerado automaticamente."
            icon="qr"
            label="01 — Crie o evento"
          />
          <Step
            copy="Escaneiam o QR, informam o nome e enviam fotos pelo celular. Sem app, sem cadastro."
            icon="phone"
            label="02 — Convidados enviam"
          />
          <Step
            accent
            copy="Você aprova as fotos. As aprovadas aparecem automaticamente no telão."
            icon="screen"
            label="03 — O telão exibe ao vivo"
          />
        </div>
        <ScreenMock />
      </div>
    </section>
  );
}

function Step({
  accent = false,
  copy,
  icon,
  label,
}: {
  accent?: boolean;
  copy: string;
  icon: "phone" | "qr" | "screen";
  label: string;
}) {
  return (
    <article className="flex gap-5 border-b border-black/[0.07] bg-[#FBF5EE] p-5 last:border-b-0 lg:bg-transparent lg:px-0 lg:py-6">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-[#D4562B]" : "bg-[#1D1108]"
        }`}
      >
        <Icon name={icon} light={accent} />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4562B]">
          {label}
        </p>
        <p className="text-sm leading-6 text-[#8A6B55]">{copy}</p>
      </div>
    </article>
  );
}

function ScreenMock() {
  const tiles = [
    ["Ana & Pedro", "há 1 minuto · Que dia lindo!", "from-[#D4A875] to-[#845028]", "col-span-2 row-span-2"],
    ["Beatriz", "", "from-[#E8B040] to-[#B86818]", ""],
    ["Miguel", "", "from-[#D4562B] to-[#8E2D0E]", ""],
    ["Carla", "", "from-[#8E9B8A] to-[#4A5A46]", ""],
    ["Família", "", "from-[#C4889A] to-[#7A4055]", ""],
  ];

  return (
    <div className="hidden flex-col items-center gap-3 lg:flex">
      <div className="relative w-full max-w-[680px] rounded-[14px] bg-[#0E0806] p-3 pb-2 shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(212,86,43,0.08)] [animation:landing-live-pulse_3.5s_ease-in-out_1.8s_infinite]">
        <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
          <p className="font-[family-name:var(--font-display)] text-lg italic text-[#D4562B]">revela</p>
          <div className="flex items-center gap-2">
            <p className="text-[9px] italic text-[#7A5B44]">Casamento Ana & Pedro</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(22,163,74,0.25)] bg-[rgba(22,163,74,0.15)] px-2 py-0.5 text-[8px] font-bold text-[#16A34A]">
              <span className="h-1 w-1 rounded-full bg-[#16A34A]" /> AO VIVO
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 grid-rows-[130px_130px] gap-1 overflow-hidden rounded-lg [animation:landing-grid-appear_0.7s_cubic-bezier(0.22,1,0.36,1)_0.25s_both]">
          {tiles.map(([name, detail, gradient, span], index) => (
            <div
              className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${span} ${
                index === 0
                  ? "[animation:landing-photo-in_0.6s_cubic-bezier(0.22,1,0.36,1)_0.4s_both]"
                  : ""
              }`}
              key={name}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_38%_22%,rgba(255,255,255,0.18)_0%,transparent_55%)]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="font-[family-name:var(--font-display)] text-sm font-semibold italic text-white">
                  {name}
                </p>
                {detail ? <p className="mt-1 text-[9px] text-white/60">{detail}</p> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 right-5 rounded-[10px] bg-white/95 p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <QrGlyph className="h-11 w-11 text-[#1D1108]" />
          <p className="mt-1 text-center text-[8px] font-bold text-[#1D1108]">Envie sua foto</p>
        </div>
      </div>
      <div className="h-1 w-20 rounded bg-[#0E0806]" />
      <div className="-mt-2 h-2 w-44 rounded bg-[#1A1008]" />
      <p className="text-center text-xs italic text-[#B09585]">
        O telão exibe em tempo real as fotos aprovadas
      </p>
    </div>
  );
}

function Plans({
  audience,
  plans,
  setAudience,
}: {
  audience: PlanAudience;
  plans: typeof partyPlans;
  setAudience: (audience: PlanAudience) => void;
}) {
  return (
    <section className="px-5 py-20 sm:px-10 lg:px-[72px] lg:py-24" id="planos">
      <SectionHeader
        label="Planos"
        subtitle="Vai celebrar uma vez, ou organizar eventos o ano inteiro?"
        title="Um plano para cada tipo de celebração"
      />
      <div className="mt-10 flex justify-center">
        <div className="inline-flex rounded-[14px] bg-[#F0E6D8] p-1.5">
          <button
            className={`rounded-[10px] px-4 py-2 text-sm font-bold transition sm:px-6 ${
              audience === "party" ? "bg-[#D4562B] text-white" : "text-[#8A6B55]"
            }`}
            onClick={() => setAudience("party")}
            type="button"
          >
            Para minha festa
          </button>
          <button
            className={`rounded-[10px] px-4 py-2 text-sm font-bold transition sm:px-6 ${
              audience === "business" ? "bg-[#D4562B] text-white" : "text-[#8A6B55]"
            }`}
            onClick={() => setAudience("business")}
            type="button"
          >
            Para minha empresa
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1080px] gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-[#B09585]">
        Valores e pacotes são referência de design e podem ser ajustados antes da
        publicação comercial. A cobrança ainda não está ativa no produto.
      </p>
    </section>
  );
}

function PlanCard({ plan }: { plan: (typeof partyPlans)[number] }) {
  return (
    <article
      className={`relative flex flex-col rounded-[20px] bg-white p-8 shadow-[0_2px_14px_rgba(0,0,0,0.05)] ${
        plan.highlighted
          ? "border-2 border-[#D4562B] shadow-[0_12px_40px_rgba(212,86,43,0.16)]"
          : "border border-black/[0.07]"
      }`}
    >
      {plan.highlighted ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4562B] px-4 py-1 text-xs font-bold text-white">
          {plan.badge}
        </span>
      ) : (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4562B]">
          {plan.badge}
        </p>
      )}
      <h3 className="font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[#1D1108]">
        {plan.name}
      </h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-[42px] font-semibold italic text-[#1D1108]">
          {plan.price}
        </span>
        {plan.suffix ? <span className="text-sm text-[#8A6B55]">{plan.suffix}</span> : null}
      </div>
      <ul className="mt-6 grid gap-3">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-2.5 text-[13.5px] leading-6 text-[#5A4335]" key={feature}>
            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(212,86,43,0.12)] text-[10px] font-black text-[#D4562B]">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-[10px] text-sm font-bold ${
          plan.highlighted
            ? "bg-[#D4562B] text-white hover:bg-[#BA4620]"
            : "border border-[rgba(29,17,8,0.16)] text-[#1D1108]"
        }`}
        href="/admin/login"
      >
        {plan.cta}
      </Link>
    </article>
  );
}

function Celebrations() {
  return (
    <section className="px-5 py-20 sm:px-10 lg:px-[72px]">
      <SectionHeader label="Feito para todos os momentos" title="Para cada celebração" />
      <div className="mx-auto mt-12 grid max-w-[900px] gap-5 sm:grid-cols-2">
        {celebrations.map((item) => (
          <article
            className="relative rounded-[20px] border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.05)] sm:p-8"
            key={item.title}
          >
            <span className={`absolute right-6 top-6 h-11 w-11 rounded-full bg-gradient-to-br ${item.color}`} />
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4562B]">
              {item.category}
            </p>
            <h3 className="max-w-[220px] font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[#1D1108]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#8A6B55]">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuoteCta() {
  return (
    <section className="bg-[#1D1108] px-5 py-20 text-center sm:px-10 lg:px-[72px]">
      <div className="mx-auto max-w-[700px]">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold italic leading-tight text-[#FBF5EE] sm:text-[40px]">
          “Depois que a festa acaba, o que resta são as fotos.”
        </p>
        <p className="mx-auto mt-7 max-w-[480px] text-[15px] leading-7 text-[#8A6B55]">
          Configure em minutos. Compartilhe o QR Code. Deixe as memórias se
          revelarem sozinhas.
        </p>
        <Link
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#D4562B] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#BA4620]"
          href="/admin/login"
        >
          Criar evento gratuitamente <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-3 border-t border-white/[0.05] bg-[#1D1108] px-5 py-7 text-[#5A3D2B] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[72px]">
      <div>
        <p className="font-[family-name:var(--font-display)] text-[22px] italic text-[#D4562B]">
          revela
        </p>
        <p className="text-[11px]">Fotos que revelam o momento.</p>
      </div>
      <p className="text-[11px]">revela.gersonvan.com.br</p>
    </footer>
  );
}

function SectionHeader({
  label,
  subtitle,
  title,
}: {
  label: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="text-center">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4562B]">
        {label}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[#1D1108] sm:text-[52px]">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 text-[15px] text-[#8A6B55]">{subtitle}</p> : null}
    </div>
  );
}

function Icon({ light, name }: { light?: boolean; name: "phone" | "qr" | "screen" }) {
  const color = light ? "white" : "#D4562B";

  if (name === "phone") {
    return (
      <svg fill="none" height="20" viewBox="0 0 22 22" width="20">
        <rect height="19" rx="2.5" stroke={color} strokeWidth="1.8" width="11" x="5.5" y="1.5" />
        <circle cx="11" cy="10" r="2.8" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "screen") {
    return (
      <svg fill="none" height="20" viewBox="0 0 22 22" width="20">
        <rect height="13" rx="2" stroke={color} strokeWidth="1.8" width="19" x="1.5" y="3.5" />
        <path d="M8 20.5h6M11 16.5v4" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return <QrGlyph className="h-5 w-5" color={color} />;
}

function QrGlyph({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} fill={color} viewBox="0 0 44 44">
      <rect height="14" rx="2" width="14" x="4" y="4" />
      <rect fill="white" height="10" width="10" x="6" y="6" />
      <rect height="6" width="6" x="8" y="8" />
      <rect height="14" rx="2" width="14" x="26" y="4" />
      <rect fill="white" height="10" width="10" x="28" y="6" />
      <rect height="6" width="6" x="30" y="8" />
      <rect height="14" rx="2" width="14" x="4" y="26" />
      <rect fill="white" height="10" width="10" x="6" y="28" />
      <rect height="6" width="6" x="8" y="30" />
      <rect height="5" width="5" x="26" y="26" />
      <rect height="5" width="5" x="33" y="26" />
      <rect height="5" width="5" x="26" y="33" />
      <rect height="5" width="5" x="33" y="33" />
    </svg>
  );
}
