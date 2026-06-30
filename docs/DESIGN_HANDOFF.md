# Handoff: Revela — Adaptação Visual do MVP

## Visão Geral

Este pacote documenta a adaptação visual do sistema **Revela**.
O MVP funcional já está implementado em Next.js 16 + Tailwind CSS 4 + Prisma.
A tarefa é **substituir a UI provisória** pelas classes e estruturas do design Revela,
sem alterar lógica de negócio, Server Actions, APIs ou schema do banco.

> **Os arquivos `.dc.html` nesta pasta são referências de design** — protótipos HTML
> que mostram o visual e o layout pretendidos. Eles **não** são código de produção.
> O objetivo é recriar o mesmo visual dentro do codebase Next.js existente,
> usando Tailwind CSS e os padrões já estabelecidos no projeto.

---

## Fidelidade

**Alta fidelidade (hifi).** Os mocks mostram cores exatas, tipografia, espaçamentos e
hierarquia visual finais. O desenvolvedor deve recriar pixel a pixel usando as classes
Tailwind e os tokens CSS descritos abaixo.

---

## Design System Revela

### Identidade

| Elemento | Valor |
|---|---|
| Nome da marca | **revela** (sempre minúsculo) |
| Fonte display (logo, nome do evento) | **Cormorant Garamond**, italic |
| Fonte UI (todo o resto) | **Bricolage Grotesque** |
| Tom | Elegante, quente, fotográfico |

### Como carregar as fontes

Em `src/app/layout.tsx`, substituir Geist por:

```tsx
import { Cormorant_Garamond, Bricolage_Grotesque } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
```

Aplicar no `<html>`: `className={`${cormorant.variable} ${bricolage.variable}`}`

### Tokens CSS — `src/app/globals.css`

Substituir o conteúdo atual por:

```css
@import "tailwindcss";

:root {
  /* Superfícies */
  --bg:           #FBF5EE;   /* fundo principal */
  --bg-subtle:    #F4EDE1;   /* fundo sidebar-strip, header */
  --bg-card:      #FFFFFF;   /* cards e painéis */
  --bg-input:     #F4EDE1;   /* inputs e textareas */

  /* Sidebar escura (admin) */
  --sidebar-bg:   #1D1108;
  --sidebar-text: #F0DDD0;
  --sidebar-muted:#7A5B44;
  --sidebar-active-bg: rgba(212,86,43,0.15);
  --sidebar-active-border: #D4562B;

  /* Texto */
  --text-primary: #1D1108;
  --text-muted:   #8A6B55;
  --text-subtle:  #B09585;

  /* Accent / Brand */
  --accent:       #D4562B;   /* terracota — CTA principal */
  --accent-hover: #BA4620;
  --accent-light: rgba(212,86,43,0.10);
  --accent-border: rgba(212,86,43,0.35);

  /* Bordas */
  --border:       rgba(29,17,8,0.08);
  --border-strong:rgba(29,17,8,0.18);

  /* Status */
  --status-pending-bg:   rgba(212,86,43,0.10);
  --status-pending-text: #D4562B;
  --status-approved-bg:  rgba(22,163,74,0.10);
  --status-approved-text:#16A34A;
  --status-rejected-bg:  rgba(220,38,38,0.08);
  --status-rejected-text:#DC2626;
  --status-online:       #16A34A;
  --status-warning:      #D4562B;

  /* Tipografia */
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-sans:    "Bricolage Grotesque", system-ui, sans-serif;
}

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text-primary);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-sans);
}
```

### Mapeamento de classes — antes → depois

| Antes (provisório) | Depois (Revela) |
|---|---|
| `bg-[#f6f4ef]` | `bg-[#FBF5EE]` |
| `bg-[#fbfaf7]` | `bg-[#F4EDE1]` |
| `text-[#172026]` / `text-[#1f2933]` | `text-[#1D1108]` |
| `text-[#52616b]` | `text-[#8A6B55]` |
| `text-[#9a5a44]` | `text-[#D4562B]` |
| `border-[#ddd5c7]` / `border-[#d7cfc1]` | `border-[#E8DDD1]` ou `border-black/8` |
| `bg-[#172026]` (botão CTA) | `bg-[#D4562B]` |
| `hover:bg-[#2a3740]` | `hover:bg-[#BA4620]` |
| `focus:border-[#9a5a44]` | `focus:border-[#D4562B]` |
| `font-geist-sans` | `font-sans` (Bricolage) |

---

## Telas — Detalhamento

---

### 1. Layout Raiz — `src/app/layout.tsx`

**Mudar:**
- Remover imports de Geist. Adicionar Cormorant Garamond + Bricolage Grotesque (ver seção de fontes).
- Atualizar `metadata.title` para `"Revela"`.
- Atualizar `metadata.description` para `"Fotos que revelam o momento."`.
- Aplicar as variáveis CSS das duas fontes no `<html>`.

---

### 2. Home — `src/app/page.tsx`

**Layout atual:** seção de texto + 3 cards em grid.

**Mudanças visuais:**
- Background: `bg-[#FBF5EE]`.
- Label do produto: substituir `"Revela"` por `"revela"` com `font-[family-name:var(--font-display)] italic text-3xl text-[#D4562B]`.
- H1: manter estrutura, trocar cor para `text-[#1D1108]`, fonte `font-sans font-700`.
- Subtítulo: `text-[#8A6B55]`.
- Cards: `bg-white border border-[#E8DDD1] rounded-xl shadow-sm`.
- Título do card: `text-[#1D1108] font-700`.
- Texto do card: `text-[#8A6B55]`.

---

### 3. Login Admin — `src/app/admin/login/page.tsx`

**Mudanças visuais:**
- Background: `bg-[#1D1108]` (escuro, página de login tem fundo dark).
- Card central: `bg-[#F4EDE1] rounded-2xl p-8 shadow-2xl max-w-sm`.
- Logo: `font-[family-name:var(--font-display)] italic text-4xl text-[#D4562B]`.
- Tagline: `text-[#8A6B55] text-xs uppercase tracking-widest`.
- Botão Google: `bg-white border border-[#E8DDD1] text-[#1D1108] font-700 rounded-lg h-11`.
- Aviso de OAuth não configurado: `text-[#D4562B] text-sm`.

---

### 4. Admin — Lista de Eventos — `src/app/admin/page.tsx`

**Layout atual:** `<main>` com `max-w-6xl`, header + tabela de eventos.

**Mudanças estruturais:** Adicionar sidebar fixa lateral (ver componente abaixo).

**Novo layout geral:**
```tsx
<div className="flex min-h-screen">
  <AdminSidebar activeRoute="/admin" />        {/* novo componente */}
  <main className="flex-1 bg-[#FBF5EE] px-8 py-8">
    {/* conteúdo atual, com cores atualizadas */}
  </main>
</div>
```

**Mudanças no conteúdo:**
- Label "Admin": `text-[#D4562B] text-xs uppercase tracking-widest font-700`.
- H1 "Eventos": `font-[family-name:var(--font-display)] italic text-3xl text-[#1D1108]`.
- Botão "Novo evento": `bg-[#D4562B] text-white rounded-lg h-10 px-5 font-700`.
- Botão "Sair": `border border-[#E8DDD1] text-[#8A6B55] rounded-lg h-10 px-4 font-600`.
- Lista de eventos: `bg-white border border-[#E8DDD1] rounded-xl divide-y divide-[#F0E8DF]`.
- Nome do evento: `font-[family-name:var(--font-display)] italic text-xl text-[#1D1108]`.
- Slug: `text-[#8A6B55] text-sm`.
- Badge de status: ver tabela abaixo.
- Badge de contadores: `bg-[#F4EDE1] text-[#8A6B55] rounded-lg px-3 py-1 text-sm`.

**Badges de status do evento:**
| Status | Classes |
|---|---|
| DRAFT (Rascunho) | `bg-[#F4EDE1] text-[#8A6B55]` |
| ACTIVE (Ativo) | `bg-[rgba(22,163,74,0.10)] text-[#16A34A]` |
| CLOSED (Encerrado) | `bg-[rgba(29,17,8,0.06)] text-[#8A6B55]` |

---

### 5. Sidebar Admin — Novo componente `src/components/admin/admin-sidebar.tsx`

O design Revela tem sidebar fixa escura em todas as páginas admin.
Criar como Client Component para suporte a `usePathname`.

**Estrutura:**
```tsx
<aside className="w-52 min-w-52 bg-[#1D1108] flex flex-col border-r border-white/5">
  {/* Logo */}
  <div className="px-4 py-4 border-b border-white/7">
    <span className="font-display italic text-xl text-[#D4562B]">revela</span>
    <span className="block text-[8px] text-[#7A5B44] uppercase tracking-widest mt-0.5">
      gestão de eventos
    </span>
  </div>

  {/* Evento ativo (opcional — passar como prop) */}
  {activeEventName && (
    <div className="px-4 py-3 border-b border-white/5">
      <span className="text-[8px] text-[#7A5B44] uppercase tracking-widest">Evento ativo</span>
      <p className="font-display italic text-sm text-[#F0DDD0] mt-0.5 leading-snug">
        {activeEventName}
      </p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        <span className="text-[10px] text-[#16A34A]">Ativo</span>
      </div>
    </div>
  )}

  {/* Nav links */}
  <nav className="flex-1 py-1.5">
    <SidebarLink href="/admin" label="Visão Geral" active={...} icon={...} />
    <SidebarLink href={`/admin/events/${eventId}`} label="Fotos" badge={pendingCount} ... />
    <SidebarLink href="..." label="Moderadores" ... />
    <SidebarLink href="..." label="QR Code" ... />
    <SidebarLink href="..." label="Telão" ... />
    <SidebarLink href="..." label="Configurações" ... />
  </nav>

  {/* Avatar admin */}
  <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4562B] to-[#F97316]
                    flex items-center justify-center text-white text-xs font-700">
      {adminInitial}
    </div>
    <div>
      <p className="text-[11px] text-[#F0DDD0] font-600">{adminName}</p>
      <p className="text-[9px] text-[#7A5B44]">Admin</p>
    </div>
  </div>
</aside>
```

**SidebarLink ativo** (`isActive === true`):
```
bg-[rgba(212,86,43,0.15)] border-l-[2.5px] border-[#D4562B] text-[#F0DDD0] font-600
```

**SidebarLink inativo:**
```
text-[#7A5B44] hover:text-[#F0DDD0]
```

**Badge de pendentes:**
```
bg-[rgba(212,86,43,0.2)] text-[#D4562B] rounded-full px-2 py-0.5 text-[9px] font-700
```

---

### 6. Admin — Detalhe do Evento — `src/app/admin/events/[eventId]/page.tsx`

**Mudanças estruturais:** envolver em `flex` com `<AdminSidebar>`.

**Cards de métricas** (componente `<Metric>`):
```tsx
<div className="bg-white border border-[#E8DDD1] rounded-xl p-4 shadow-sm">
  <p className="text-[9px] text-[#8A6B55] uppercase tracking-wide">{label}</p>
  <p className="font-[family-name:var(--font-display)] text-3xl text-[#1D1108] font-600 mt-1.5 leading-none">
    {value}
  </p>
</div>
```

Cor do número por tipo:
| Métrica | Cor do número |
|---|---|
| Total | `text-[#1D1108]` |
| Pendentes | `text-[#D4562B]` + `border-[rgba(212,86,43,0.2)]` |
| Aprovadas | `text-[#16A34A]` + `border-[rgba(22,163,74,0.18)]` |
| Rejeitadas | `text-[#DC2626]` + `border-[rgba(220,38,38,0.14)]` |

**Seção QR Code e links:** manter estrutura, atualizar cores.

**Moderadores:**
- Card de moderador: `bg-white border border-[#E8DDD1] rounded-xl p-3 flex items-center gap-2`.
- Avatar: gradiente `from-[#D4562B] to-[#F97316]`.
- Nome: `text-[#1D1108] font-600 text-sm`.
- Decisões / status: `text-[#8A6B55] text-[9px]`.
- Indicador online (USED): `w-1.5 h-1.5 rounded-full bg-[#16A34A]`.
- Indicador offline (CREATED): `w-1.5 h-1.5 rounded-full bg-[#D4562B]`.
- Botão revogar: `border border-[#E8DDD1] text-[#8A6B55] text-xs rounded-lg px-3 h-8`.
- Botão "+ Novo moderador": `border border-dashed border-[#E8DDD1] text-[#8A6B55] text-sm rounded-xl w-full py-2 font-600`.

**Botão "Encerrar Evento":**
```
bg-[#D4562B] text-white rounded-lg h-10 px-4 font-700
```

**Botão "Ativar":**
```
border border-[#E8DDD1] text-[#1D1108] rounded-lg h-10 px-4 font-600
```

---

### 7. Admin — Criar Evento — `src/app/admin/events/new/page.tsx`

**Mudanças estruturais:** envolver em `flex` com `<AdminSidebar>`.

**Formulário:**
- Card: `bg-white border border-[#E8DDD1] rounded-xl p-6 shadow-sm`.
- `<label>`: `text-[9px] text-[#8A6B55] uppercase tracking-wide font-700 block mb-1.5`.
- `<input>`: `h-11 w-full rounded-lg border border-[#E8DDD1] bg-[#F4EDE1] px-3 text-sm text-[#1D1108] outline-none focus:border-[#D4562B] focus:ring-1 focus:ring-[#D4562B]`.
- `<textarea>`: mesmas classes do input + `resize-none`.
- Botão CTA: `bg-[#D4562B] text-white h-11 px-6 rounded-lg font-700 text-sm`.
- Botão cancelar: `border border-[#E8DDD1] text-[#8A6B55] h-11 px-5 rounded-lg font-600 text-sm`.

**Opcional — adicionar indicador de passos** (ver mock `3c` no arquivo de design):
```tsx
// Passos: 1 Dados do Evento → 2 Configurações → 3 Revisão
// O formulário atual pode ser mantido numa única página (sem wizard real)
// mas o indicador visual pode ser exibido de forma decorativa.
```

---

### 8. Convidado — Upload — `src/app/e/[slug]/page.tsx` + `photo-upload-form.tsx`

**Layout atual:** `max-w-2xl` centrado, formulário único.

**Mudanças na página (`page.tsx`):**
- Background: `style={{ backgroundColor: event.secondaryColor ?? '#FBF5EE' }}` (já dinâmico — manter).
- Label do evento: `font-[family-name:var(--font-display)] italic text-3xl text-[#1D1108]`.
- Texto explicativo: `text-[#8A6B55] text-sm leading-6`.
- Usar cor primária do evento para acentos em vez de `#9a5a44` hardcoded.

**Mudanças no formulário (`photo-upload-form.tsx`):**

Card wrapper:
```
bg-white border border-[#E8DDD1] rounded-2xl p-5 shadow-sm mt-8
```

Campo "Nome/apelido":
```
h-11 w-full rounded-lg border-1.5 border-[#E8DDD1] bg-[#F4EDE1] px-3 text-base
text-[#1D1108] outline-none focus:border-[#D4562B]
```

Bloco de autorização:
```
rounded-xl border border-[#E8DDD1] bg-[#F4EDE1] p-4
```
- Checkbox ativado: usar `accent-[#D4562B]` no CSS ou wrapper customizado.
- Título: `text-sm font-700 text-[#1D1108]`.
- Texto: `text-sm leading-6 text-[#8A6B55]`.

Input de arquivo:
```
border border-dashed border-[#E8DDD1] bg-[#F4EDE1] rounded-xl p-4 text-sm text-[#8A6B55]
```
Centro: ícone 📸 + `text-[#1D1108] font-700 text-sm` + `text-[#8A6B55] text-xs`.

Cards de preview de foto:
```
overflow-hidden rounded-xl border border-[#E8DDD1]
```
- Imagem: `aspect-[4/3] w-full object-cover`.
- Textarea de mensagem: `min-h-16 w-full rounded-lg border border-[#E8DDD1] px-3 py-2 text-sm bg-[#F4EDE1] focus:border-[#D4562B]`.
- Contador de caracteres: `text-right text-xs text-[#B09585]`.
- Botão "Remover": `text-sm font-600 text-[#D4562B]`.

Botão de envio (CTA principal):
```
h-12 w-full rounded-xl bg-[#D4562B] text-white text-sm font-700
disabled:bg-[#C0A898] disabled:cursor-not-allowed
```

Mensagem de sucesso: `text-sm font-600 text-[#16A34A]`.
Mensagem de erro: `text-sm font-600 text-[#DC2626]`.

**Estado de sucesso** — após envio, mostrar tela de confirmação (ver mock `3b`, passo 4):
```tsx
{status === "success" && (
  <div className="flex flex-col items-center gap-4 py-8 text-center">
    <div className="w-14 h-14 rounded-full border-2 border-[#16A34A] bg-[rgba(22,163,74,0.1)]
                    flex items-center justify-center">
      ✓ {/* ícone check */}
    </div>
    <p className="font-[family-name:var(--font-display)] italic text-xl text-[#1D1108]">
      Fotos enviadas!
    </p>
    <p className="text-sm text-[#8A6B55] max-w-xs leading-5">{statusMessage}</p>
    <div className="bg-[#F4EDE1] border border-[#E8DDD1] rounded-xl px-4 py-3 w-full text-center">
      <p className="text-[9px] text-[#8A6B55] uppercase tracking-wide">Status</p>
      <p className="text-[#D4562B] font-700 text-sm mt-1">Aguardando moderação</p>
    </div>
    <button onClick={() => setStatus("idle")}
      className="w-full h-11 border border-[#E8DDD1] rounded-xl text-[#1D1108] font-700 text-sm">
      + Enviar mais fotos
    </button>
  </div>
)}
```

---

### 9. Moderador — `src/app/moderate/[token]/page.tsx`

**Layout atual:** `max-w-5xl` centrado, grid de cards.

**Mudanças na página:**
- Background: `bg-[#FBF5EE]`.
- Header label "Moderacao": `text-[#D4562B] text-xs uppercase tracking-widest font-700`.
- H1 (nome do evento): `font-[family-name:var(--font-display)] italic text-3xl text-[#1D1108]`.
- Nome do moderador: `text-[#8A6B55] text-sm`.

**Tabs de navegação (Pendentes / Aprovadas / Rejeitadas):**
```tsx
// Tab ativa:
"rounded-lg bg-[#1D1108] text-white px-3 py-3 text-center text-sm font-700"

// Tab inativa:
"rounded-lg border border-[#E8DDD1] bg-white px-3 py-3 text-center text-sm font-600 text-[#8A6B55]"
```

Badge de contagem na tab Pendentes (quando > 0):
```
ml-1.5 bg-[rgba(212,86,43,0.12)] text-[#D4562B] rounded-full px-2 text-[10px] font-700
```

**Card de foto** (componente `<PhotoCard>`):
```tsx
<article className="overflow-hidden rounded-2xl border border-[#E8DDD1] bg-white shadow-sm">
  <img className="aspect-[4/3] w-full object-cover" ... />
  <div className="p-4 space-y-3">
    <div>
      <h2 className="font-700 text-[#1D1108] text-sm">{photo.guestName}</h2>
      <p className="text-[10px] text-[#8A6B55] mt-0.5">{formattedDate}</p>
    </div>
    {photo.message && (
      <p className="text-sm text-[#8A6B55] italic leading-5">"{photo.message}"</p>
    )}
    {/* Botões */}
    <div className="grid grid-cols-2 gap-2">
      {/* Aprovar */}
      <button className="h-10 rounded-xl bg-[#16A34A] text-white text-sm font-700">
        ✓ Aprovar
      </button>
      {/* Rejeitar */}
      <button className="h-10 rounded-xl border border-[rgba(220,38,38,0.3)]
                          bg-[rgba(220,38,38,0.06)] text-[#DC2626] text-sm font-700">
        ✕ Rejeitar
      </button>
    </div>
  </div>
</article>
```

**Alerta de novas fotos** (`<ModerationAutoRefresh>`):
```
rounded-xl border border-[rgba(212,86,43,0.3)] bg-[rgba(212,86,43,0.08)]
px-4 py-3 text-sm font-700 text-[#D4562B]
```

**Estado vazio:**
```
bg-white border border-[#E8DDD1] rounded-2xl p-8 shadow-sm
```

---

### 10. Telão — `src/app/screen/[slug]/page.tsx`

**Mudanças na página:**
- Background: `style={{ backgroundColor: event.secondaryColor ?? '#FBF5EE' }}` (já dinâmico — manter).
- QR overlay (canto inferior direito): `bg-white/95 rounded-2xl p-3 shadow-xl`.
  - Título "Envie suas fotos": `font-700 text-[#1D1108] text-sm`.
  - Subtítulo: `text-[#8A6B55] text-xs leading-5 max-w-[180px]`.

**Estado vazio** (`<EmptyScreen>`):
- Label do produto: `font-[family-name:var(--font-display)] italic text-5xl text-[#D4562B]`.
- Nome do evento: `font-[family-name:var(--font-display)] italic text-4xl text-[#1D1108] leading-tight mt-4`.
- Texto: `text-xl text-[#8A6B55] leading-9 max-w-2xl mt-6`.
- Painel QR (`<QrPanel>`):
  ```
  bg-white rounded-2xl p-6 text-center shadow-xl
  ```
  - Título: `font-[family-name:var(--font-display)] italic text-xl text-[#D4562B]`.

**Feed ao vivo** (`<LivePhotoFeed>` em `live-photo-feed.tsx`):
- Manter grid `grid-cols-4 auto-rows-fr` com o item `[0]` como `col-span-2 row-span-2`.
- Cards: `rounded-2xl overflow-hidden bg-black shadow-lg`.
- Overlay inferior: `bg-gradient-to-t from-black/80 to-transparent`.
  - Nome do convidado: `font-[family-name:var(--font-display)] italic text-base font-600 text-white`.
  - Mensagem: `text-sm leading-5 text-white/85 line-clamp-2 mt-1`.
- Botão "Tela cheia":
  ```
  bg-white/90 rounded-xl px-4 py-2 text-sm font-700 text-[#1D1108] shadow-md hover:bg-white
  ```

---

## Interações e Comportamento

Todos os comportamentos existentes devem ser mantidos:

| Comportamento | Status |
|---|---|
| Polling moderação (4s) | Manter — `moderation-auto-refresh.tsx` |
| Polling telão (4s) | Manter — `live-photo-feed.tsx` |
| localStorage de nome + aceite | Manter — `photo-upload-form.tsx` |
| Server Actions (upload, moderar, criar evento) | Não alterar |
| Vinculação de moderador por cookie | Não alterar |
| QR Code gerado pelo backend | Não alterar |
| Exportação JSON e ZIP | Não alterar |

---

## Tokens de Design Resumidos

### Cores

| Token | Hex | Uso |
|---|---|---|
| `--accent` | `#D4562B` | CTA, logo claro, bordas ativas |
| `--bg` | `#FBF5EE` | Fundo principal |
| `--bg-subtle` | `#F4EDE1` | Fundo de header, inputs, cards internos |
| `--bg-card` | `#FFFFFF` | Cards e painéis |
| `--sidebar-bg` | `#1D1108` | Sidebar admin |
| `--text-primary` | `#1D1108` | Texto principal |
| `--text-muted` | `#8A6B55` | Texto secundário |
| `--text-subtle` | `#B09585` | Placeholders, contadores |
| `--status-approved` | `#16A34A` | Aprovadas |
| `--status-rejected` | `#DC2626` | Rejeitadas |
| `--status-pending` | `#D4562B` | Pendentes |

### Tipografia

| Elemento | Fonte | Peso | Estilo |
|---|---|---|---|
| Logo "revela" | Cormorant Garamond | 400 | italic |
| Nome do evento (títulos) | Cormorant Garamond | 600 | italic |
| Números grandes (métricas) | Cormorant Garamond | 600 | normal |
| Botões, labels, body | Bricolage Grotesque | 400–800 | normal |

### Border radius

| Elemento | Valor |
|---|---|
| Cards principais | `rounded-2xl` (16px) |
| Botões CTA | `rounded-xl` (12px) |
| Inputs | `rounded-lg` (8px) |
| Badges / pills | `rounded-full` |

### Sombras

| Elemento | Valor |
|---|---|
| Cards | `shadow-sm` |
| Modais e painéis flutuantes | `shadow-xl` |
| QR overlay no telão | `shadow-xl` |

---

## Assets

- **Fontes**: Cormorant Garamond + Bricolage Grotesque — ambas disponíveis via `next/font/google`. Não há arquivos locais necessários.
- **Ícones**: O design usa SVGs simples inline (sem biblioteca de ícones). Pode-se usar [Lucide React](https://lucide.dev) como alternativa para os ícones de nav da sidebar.
- **QR Code**: gerado pelo backend via `qrcode` — não alterar.

---

## Arquivos de Referência

| Arquivo | Descrição |
|---|---|
| `Layout Sistema.dc.html` | Protótipo HTML completo — Turn 1 (3 direções), Turn 2 (Revela claro/escuro), Turn 3 (Telão, Fluxo Convidado, Criar Evento) |

Abra o arquivo `.dc.html` em qualquer navegador moderno para ver o design de referência interativo. Use pan/zoom para inspecionar detalhes.

---

## Checklist de Implementação

```
[ ] Atualizar globals.css com tokens CSS
[ ] Atualizar layout.tsx com Cormorant Garamond + Bricolage Grotesque
[ ] Criar componente <AdminSidebar> (src/components/admin/admin-sidebar.tsx)
[ ] Aplicar sidebar em /admin, /admin/events/new, /admin/events/[eventId]
[ ] Atualizar src/app/page.tsx (home)
[ ] Atualizar src/app/admin/login/page.tsx
[ ] Atualizar src/app/admin/page.tsx
[ ] Atualizar src/app/admin/events/new/page.tsx
[ ] Atualizar src/app/admin/events/[eventId]/page.tsx
[ ] Atualizar src/components/upload/photo-upload-form.tsx
[ ] Atualizar src/app/e/[slug]/page.tsx
[ ] Atualizar src/app/moderate/[token]/page.tsx
[ ] Atualizar src/app/screen/[slug]/page.tsx + live-photo-feed.tsx
[ ] Testar fluxo completo: upload → moderação → telão
[ ] Testar em mobile (320px+) — convidado e moderador são mobile-first
[ ] Testar telão em fullscreen (1920×1080)
```
