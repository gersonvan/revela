# Handoff: revela — Landing Page

## Visão Geral

Landing page de marketing do **revela**, sistema de envio de fotos por QR Code para eventos privados com exibição ao vivo no telão. O objetivo da página é converter organizadores de eventos (casamentos, aniversários, festas infantis, eventos corporativos) em admins que criam eventos na plataforma.

---

## Sobre os Arquivos de Design

Os arquivos `.dc.html` nesta pasta são **referências de design criadas em HTML** — protótipos que mostram o visual e o comportamento pretendidos. O objetivo é **recriar esse visual no codebase Next.js existente**, usando Tailwind CSS e os padrões já estabelecidos no projeto — não copiar o HTML diretamente para produção.

---

## Fidelidade

**Alta fidelidade (hifi).** As mocks mostram cores exatas, tipografia, espaçamentos, hierarquia visual e animações finais. O desenvolvedor deve recriar pixel a pixel usando Tailwind CSS e os tokens CSS documentados abaixo.

---

## Direção Recomendada

**Opção 3a** (desktop) + **Opção 3b** (mobile), ambas no arquivo `Landing Page.dc.html`. Esta é a versão final — evolução da 2a/2b com a seção de Planos para os dois públicos do produto.

- **3a** — desktop 1440px: hero centrado, "Como funciona" com steps + mock do telão, seção **Planos** com toggle "Para minha festa" / "Para minha empresa", grid de celebrações removido do fluxo principal (mantido nas seções 1a/1b como referência), citação emocional + CTA, footer.
- **3b** — mobile 390px: mesma estrutura, toggle de planos empilhado, cards compactos.

Ambas combinadas formam a página única com breakpoints responsivos.

### Dois públicos: pessoa física × empresa de eventos

O produto atende dois perfis de cliente com modelos de cobrança diferentes:

1. **Pessoa física** — paga um pacote único por evento (casamento, aniversário, etc). Sem mensalidade.
2. **Empresa de eventos** — assinatura mensal/anual, gerencia múltiplos eventos num painel único, pode usar marca própria (white-label) e **cobrar dos seus próprios clientes pela liberação das fotos** (modelo B2B2C).

Isso é resolvido na landing com um **toggle segmentado** na seção Planos (não duas páginas separadas), preservando peso igual para os dois públicos.

### Seção Planos — Toggle B2C / B2B

**Toggle:** segmented control de 2 botões ("Para minha festa" / "Para minha empresa"), pill ativo em `#D4562B` com texto branco, inativo transparente com texto `#8A6B55`. Fundo do container: `#F0E6D8`, radius 14px, padding 6px.

**Comportamento:** clique alterna qual grid de 3 cards é exibido (implementado como estado de componente — não é CSS puro; no React/Next, usar `useState`).

#### Planos Pessoa Física (pagamento único, sem mensalidade)

| Plano | Preço | Inclui |
|---|---|---|
| Essencial | R$149 por evento | Até 300 fotos aprovadas · QR Code exclusivo e telão ao vivo · Moderação manual · Acesso e download por 15 dias |
| **Completo** (destaque) | R$249 por evento | Fotos ilimitadas · Telão ao vivo com moderação em tempo real · Acesso e download por 60 dias · Suporte prioritário no dia do evento |
| Memória Eterna | R$399 por evento | Tudo do Completo · Acesso e download vitalício · Álbum digital em alta resolução · Vídeo-resumo automático do evento |

#### Planos Empresa (assinatura)

| Plano | Preço | Inclui |
|---|---|---|
| Starter | R$179/mês | Até 3 eventos/mês · Marca própria no QR Code e telão · Painel único para gerenciar eventos |
| **Profissional** (destaque) | R$449/mês | Até 10 eventos/mês · **Cobrança de liberação de fotos direto ao cliente final** (B2B2C) · Relatórios de faturamento por evento · Marca própria + domínio personalizado |
| Enterprise | Sob consulta | Eventos ilimitados · Múltiplos usuários/moderadores · API e integrações · Gerente de conta dedicado |

**⚠️ Valores são placeholders de referência** definidos para a fidelidade do protótipo — validar/ajustar com o time de negócio antes de publicar.

**Card de destaque** ("Mais escolhido" / "Mais popular"): `border: 2px solid #D4562B`, `box-shadow: 0 12px 40px rgba(212,86,43,0.16)`, badge pill absoluto no topo centralizado (`background:#D4562B`, texto branco, `border-radius:100px`). CTA do destaque é preenchido (`background:#D4562B`); os demais são outline (`border:1.5px solid rgba(29,17,8,0.16)`).

**Feature list:** cada item usa um ícone de check (círculo `rgba(212,86,43,0.12)` + check `#D4562B`) + texto `13.5px`, cor `#5A4335`.

---

## Design Tokens

```css
/* Superfícies */
--bg:           #FBF5EE;   /* fundo principal */
--bg-subtle:    #F4EDE1;   /* fundo de inputs e seções secundárias */
--bg-card:      #FFFFFF;   /* cards e painéis */
--dark:         #1D1108;   /* fundo escuro — seções de contraste e nav */

/* Accent / Marca */
--accent:       #D4562B;   /* terracota — CTA, logo, destaques */
--accent-hover: #BA4620;
--accent-light: rgba(212,86,43,0.08);
--accent-border: rgba(212,86,43,0.18);

/* Texto */
--text-primary: #1D1108;
--text-muted:   #8A6B55;
--text-subtle:  #B09585;

/* Bordas */
--border:       rgba(29,17,8,0.07);
--border-strong:rgba(29,17,8,0.16);

/* Tipografia */
--font-display: 'Cormorant Garamond', Georgia, serif;  /* sempre italic */
--font-sans:    'Bricolage Grotesque', system-ui, sans-serif;

/* Status */
--status-live:  #16A34A;
```

### Escala de Border Radius

| Elemento | Valor |
|---|---|
| Cards principais | 20px |
| Botões CTA | 10px |
| Botões nav | 8px |
| Badges / pills | 100px |
| Cards do telão | 14px |
| Fotos no telão | 8px (container) |

### Sombras

| Elemento | Valor |
|---|---|
| Cards brancos | `0 2px 14px rgba(0,0,0,0.05)`, `border: 1px solid rgba(29,17,8,0.07)` |
| Polaroids | `0 8px 32px rgba(0,0,0,0.14)` |
| Polaroid central | `0 12px 48px rgba(0,0,0,0.18)` |
| Mock do telão | `0 24px 80px rgba(0,0,0,0.5)`, `0 0 60px rgba(212,86,43,0.08)` |

---

## Seções — Desktop (1440px)

### 1. Navbar

**Layout:** `flex`, `justify-content: space-between`, `align-items: center`  
**Padding:** `20px 72px`  
**Borda inferior:** `1px solid rgba(29,17,8,0.07)`  
**Background:** `#FBF5EE`

| Elemento | Spec |
|---|---|
| Logo "revela" | Cormorant Garamond · italic · 26px · `#D4562B` · `letter-spacing: -0.3px` |
| Links nav ("Como funciona", "Entrar") | Bricolage Grotesque · 13px · 500 · `#8A6B55` · sem underline |
| Botão "Criar evento" | Bricolage Grotesque · 14px · 700 · branco · bg `#D4562B` · padding `10px 22px` · radius 8px |

---

### 2. Hero

**Layout:** seção centrada, `text-align: center`  
**Padding:** `80px 72px 0`  
**Background:** `#FBF5EE`  
**Background decoration:** círculo radial `rgba(212,86,43,0.06)` no canto superior direito, `500px × 500px`, pointer-events none

#### Badge superior

```
display: inline-flex · align-items: center · gap: 8px
padding: 5px 16px · border-radius: 100px
background: rgba(212,86,43,0.08)
border: 1px solid rgba(212,86,43,0.18)
margin-bottom: 28px
```
- Ponto: `5×5px · border-radius: 50% · background: #D4562B`
- Texto: Bricolage · 11px · 700 · `#D4562B` · uppercase · `letter-spacing: 1.5px`
- Copy: **"A MEMÓRIA COLETIVA DA SUA FESTA"**

#### H1

```
font-family: Cormorant Garamond · italic · 600
font-size: 80px
line-height: 1.02
letter-spacing: -2px
color: #1D1108
margin: 0 0 24px
max-width: 820px
text-wrap: balance
```
Copy: **"As melhores fotos da festa não estão só no celular do fotógrafo."**

#### Descrição

```
font-family: Bricolage Grotesque · 18px · 400
color: #8A6B55 · line-height: 1.7
max-width: 540px · margin: 0 auto 40px
```
Copy: **"Com o revela, todos os seus convidados enviam fotos pelo celular via QR Code. Você modera. O telão exibe ao vivo."**

#### CTAs

```
display: flex · justify-content: center · gap: 14px
```

| Botão | Spec |
|---|---|
| "Criar meu evento" (primário) | bg `#D4562B` · branco · 14px · 700 · `padding: 14px 32px` · radius 10px · ícone seta → |
| "Como funciona" (secundário) | border `1.5px solid rgba(29,17,8,0.16)` · `#1D1108` · 14px · 600 · `padding: 13px 24px` · radius 10px |

Hover primário: bg `#BA4620`

#### Tira de Polaroids

Flex row, `justify-content: center`, `gap: 20px`, `margin-top: 64px`

Cada polaroid:
```
background: white
padding: 10px 10px 28px
border-radius: 2px
box-shadow: 0 8px 32px rgba(0,0,0,0.14)
transform: rotate(Xdeg)  ← ver tabela abaixo
```

| # | Evento | Gradiente (dentro) | Dimensões | Rotação | Offset vertical |
|---|---|---|---|---|---|
| 1 | Ana & Pedro · Casamento | `#D4A875 → #845028` | 200×220px | -4deg | — |
| 2 | Beatriz · 30 anos | `#E8B040 → #B86818` | 200×250px | +5deg | margin-bottom: 12px |
| 3 | Miguel · 5 anos *(central, maior)* | `#D4562B → #8E2D0E` | 230×280px | -1.5deg | — |
| 4 | Equipe Altera | `#8E9B8A → #4A5A46` | 200×230px | +4deg | margin-bottom: 16px |
| 5 | Carlos & Márcia · Bodas de Prata | `#C4889A → #7A4055` | 200×218px | -3deg | — |

Caption: Bricolage · 10px · italic · `#8A6B55` · text-align center · margin-top 8px

Dentro de cada polaroid: overlay radial `rgba(255,255,255,0.16 → transparent)` simulando reflexo de luz.

---

### 3. Como Funciona

**Background:** `#FFFFFF`  
**Padding:** `96px 72px`

**Cabeçalho (centrado):**
- Label: Bricolage · 11px · 700 · `#D4562B` · uppercase · `letter-spacing: 2px` · margin-bottom 12px · copy **"SIMPLES ASSIM"**
- H2: Cormorant Garamond · italic · 600 · 52px · `#1D1108` · `letter-spacing: -0.5px` · copy **"Como funciona"**
- margin-bottom: 64px

**Grid principal:**
```
display: grid
grid-template-columns: 380px 1fr
gap: 64px
max-width: 1200px
margin: 0 auto
align-items: center
```

#### Coluna esquerda — Steps

3 steps empilhados com `border-bottom: 1px solid rgba(29,17,8,0.07)` entre eles (último sem borda).  
Cada step: `display: flex · gap: 20px · padding: 24px 0`

**Ícone:** `44×44px · border-radius: 12px · background: #1D1108`  
No step 03, o ícone usa `background: #D4562B` (destaque — é o resultado final).

| Step | Ícone | Label | Título | Descrição |
|---|---|---|---|---|
| 01 | QR Code SVG | "01 — CRIE O EVENTO" | "Crie o evento" | "Configure em minutos. Um QR Code exclusivo é gerado automaticamente — pronto para a entrada da festa." |
| 02 | Celular SVG | "02 — CONVIDADOS ENVIAM" | "Convidados enviam" | "Escaneiam o QR, informam o nome e enviam fotos pelo celular. Sem app, sem cadastro." |
| 03 | Tela/TV SVG | "03 — O TELÃO EXIBE AO VIVO" | "O telão exibe ao vivo" | "Você aprova as fotos. As aprovadas aparecem automaticamente no telão — é isso que você vê ao lado." |

Texto do label: Bricolage · 10px · 700 · `#D4562B` · uppercase · `letter-spacing: 1.5px`  
Título: Cormorant Garamond · italic · 600 · — sem tamanho explícito no design (aprox. 20px)  
Descrição: Bricolage · 14px · `#8A6B55` · `line-height: 1.6`

#### Coluna direita — Mock do Telão

**Frame externo:**
```
background: #0E0806
border-radius: 14px
padding: 12px 12px 8px
width: 680px
box-shadow: (ver Sombras acima)
animation: live-pulse 3.5s ease-in-out 1.8s infinite  ← pulsação terracota
```

**Top bar (dentro do frame):**
- Logo "revela": Cormorant · italic · 18px · `#D4562B`
- Nome do evento: Bricolage · 9px · italic · `#7A5B44`
- Badge AO VIVO: `background: rgba(22,163,74,0.15)` · `border: 1px solid rgba(22,163,74,0.25)` · radius 100px · padding `2px 7px` · ponto verde `#16A34A` 4px · texto Bricolage 8px 700 `#16A34A`

**Grid de fotos:**
```
display: grid
grid-template-columns: repeat(4, 1fr)
grid-template-rows: repeat(2, 130px)
gap: 4px
border-radius: 8px
overflow: hidden
animation: grid-appear 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both
```

| Posição | Grid | Gradiente | Nome | Extra |
|---|---|---|---|---|
| Foto grande | `col: 1/3 · row: 1/3` | `#D4A875 → #845028` | "Ana & Pedro" + "há 1 minuto · "Que dia lindo!"" | `animation: photo-in 0.6s ... 0.4s both` |
| Foto pequena 1 | auto | `#E8B040 → #B86818` | "Beatriz" | — |
| Foto pequena 2 | auto | `#D4562B → #8E2D0E` | "Miguel" | — |
| Foto pequena 3 | auto | `#8E9B8A → #4A5A46` | "Carla" | — |
| Foto pequena 4 | auto | `#C4889A → #7A4055` | "Família" | — |

Cada foto tem overlay radial (reflexo) + overlay inferior `linear-gradient(to top, rgba(0,0,0,0.7), transparent)` para o texto.

Texto da foto grande: Cormorant · italic · 15px · 600 · branco + Bricolage 9px `rgba(255,255,255,0.55)` para a legenda.  
Texto das fotos pequenas: Cormorant · italic · 11px · branco.

**QR Code (canto inferior direito do frame):**
```
position: absolute · bottom: 22px · right: 22px
background: rgba(255,255,255,0.93)
border-radius: 10px · padding: 10px
box-shadow: 0 4px 16px rgba(0,0,0,0.35)
```
QR: SVG 44×44px em `#1D1108`. Label: Bricolage · 8px · 700 · `#1D1108` · centrado · "Envie sua foto"

**Suporte/base da TV:** 3 divs simulando o pé do monitor (strip escuro + base larga).

**Caption:** Bricolage · 12px · italic · `#B09585` · centrado abaixo

---

### 4. Para Cada Celebração

**Background:** `#FBF5EE`  
**Padding:** `88px 72px`

**Cabeçalho:**
- Label: **"FEITO PARA TODOS OS MOMENTOS"**
- H2: **"Para cada celebração"**

**Grid:** `2×2, max-width: 900px, gap: 20px`

Cada card:
```
background: white
border-radius: 20px
padding: 32px 28px
border: 1px solid rgba(29,17,8,0.07)
box-shadow: 0 2px 14px rgba(0,0,0,0.05)
position: relative
```

Swatch (canto sup. direito): `44×44px · border-radius: 50%`

| Card | Categoria | Título | Gradiente swatch | Copy |
|---|---|---|---|---|
| Casamentos | Cerimônia | Casamentos | `#D4A875 → #845028` | "Reúna os registros de todos os convidados em um feed ao vivo exibido durante a recepção. O dia mais especial, visto por todos." |
| Aniversários | Aniversário | Festas de aniversário | `#D4562B → #8E2D0E` | "Convidados participam ativamente — a festa ganha vida no telão com as fotos de quem estava lá." |
| Infantil | Festa infantil | Festas infantis | `#E8B040 → #B86818` | "Todo paizinho quer ver o filho no telão. Moderação manual garante que só as melhores fotos apareçam — com total segurança." |
| Corporativo | Corporativo | Eventos corporativos | `#4A8090 → #2C5060` | "Confraternizações e convenções que criam pertencimento e engajam toda a equipe." |

Categoria: Bricolage · 10px · 700 · `#D4562B` · uppercase · `letter-spacing: 1.5px` · margin-bottom 14px  
Título: Cormorant Garamond · italic · 600 · 34px · `#1D1108` · margin-bottom 12px  
Descrição: Bricolage · 14px · `#8A6B55` · `line-height: 1.65`

---

### 5. Quote + CTA

**Background:** `#1D1108`  
**Padding:** `80px 72px`  
**Alinhamento:** centrado, `max-width: 700px`, `margin: 0 auto`

| Elemento | Spec |
|---|---|
| Citação | Cormorant Garamond · italic · 600 · 40px · `#FBF5EE` · `line-height: 1.2` · `letter-spacing: -0.5px` · margin-bottom 28px |
| Citação copy | **"Depois que a festa acaba, o que resta são as fotos."** |
| Descrição | Bricolage · 15px · `#8A6B55` · `line-height: 1.6` · max-width 480px · margin 0 auto 40px |
| Descrição copy | "Configure em minutos. Compartilhe o QR Code. Deixe as memórias se revelarem sozinhas." |
| Botão CTA | bg `#D4562B` · branco · 14px · 700 · `padding: 14px 32px` · radius 10px · ícone → |
| CTA copy | **"Criar evento gratuitamente"** |

---

### 6. Footer

**Background:** `#1D1108`  
**Padding:** `28px 72px`  
**Border top:** `1px solid rgba(255,255,255,0.05)`  
**Layout:** `flex · justify-content: space-between · align-items: center`

| Elemento | Spec |
|---|---|
| Logo | Cormorant Garamond · italic · 22px · `#D4562B` |
| Tagline | Bricolage · 11px · `#5A3D2B` · **"Fotos que revelam o momento."** |
| URL | Bricolage · 11px · `#5A3D2B` · **"revela.gersonvan.com.br"** |

---

## Seções — Mobile (390px)

Mesmos conteúdos do desktop. Principais adaptações:

### Navbar mobile
- Remove links intermediários ("Como funciona", "Entrar")
- Mantém logo + botão "Criar evento"
- Padding: `14px 20px`

### Hero mobile
- H1: 44px (era 80px no desktop)
- Descrição: 15px (era 18px)
- CTAs em coluna (`flex-direction: column`), full-width
- 3 polaroids visíveis (disposição horizontal, parcialmente cortados na borda)

### Como funciona mobile
- Steps: cards empilhados com número grande em watermark (88px, opacity 0.07)
- Cada card: `background: #FBF5EE · border-radius: 16px · padding: 22px`
- Sem o mock do telão (mantém apenas os steps)

### Celebrações mobile
- Grid `2×2` (mantém, mas compacto)
- Cards menores: padding 20px, título 22px
- Swatch: `36×36px`

### Quote + CTA mobile
- Citação: 30px (era 40px)
- Botão: full-width, flex centrado

---

## Animações

### `grid-appear` (entrada do grid do telão)
```css
@keyframes grid-appear {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Aplicar no container do grid */
animation: grid-appear 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
```

### `photo-in` (entrada da foto destaque)
```css
@keyframes photo-in {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
/* Aplicar na foto grande (col-span-2 / row-span-2) */
animation: photo-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
```

### `live-pulse` (pulsação do frame do telão)
```css
@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,86,43,0), 0 24px 80px rgba(0,0,0,0.5); }
  55%       { box-shadow: 0 0 0 4px rgba(212,86,43,0.32), 0 24px 80px rgba(0,0,0,0.5); }
}
/* Aplicar no frame externo do telão */
animation: live-pulse 3.5s ease-in-out 1.8s infinite;
```

---

## Assets

| Asset | Fonte | Notas |
|---|---|---|
| Fonte Cormorant Garamond | Google Fonts | `weights: 400, 600 · styles: normal, italic` |
| Fonte Bricolage Grotesque | Google Fonts | `weights: 400, 500, 600, 700, 800` |
| Ícone QR Code | SVG inline | Desenhado manualmente — ver design |
| Ícone celular | SVG inline | Ver design |
| Ícone TV/tela | SVG inline | Ver design |
| QR Code real | Gerado pelo backend | Substituir o mock SVG pelo QR real do evento |
| Fotos nos polaroids | Placeholder gradiente | Substituir por fotos reais de eventos |
| Fotos no mock do telão | Placeholder gradiente | Componente estático — em produção vem do LivePhotoFeed |

---

## Rota de Implementação

A landing page é uma nova rota pública: `/` ou `/landing` (dependendo da decisão sobre a home atual — ver `src/app/page.tsx`).

A home atual (`src/app/page.tsx`) exibe 3 cards informativos. Recomenda-se **substituí-la** por esta landing page ou criar a landing em `/` e mover o admin para `/admin` (já é o caso).

**Checklist:**

```
[ ] Criar src/app/page.tsx com a landing page
[ ] Carregar Cormorant Garamond + Bricolage Grotesque em layout.tsx (já documentado em DESIGN_HANDOFF.md)
[ ] Implementar seção Navbar (componente compartilhável)
[ ] Implementar Hero com tira de polaroids
[ ] Implementar "Como funciona" (grid 2-col desktop / stack mobile)
[ ] Implementar mock do telão (componente estático)
[ ] Implementar "Para cada celebração" (grid 2×2)
[ ] Implementar Quote + CTA
[ ] Implementar Footer
[ ] Adicionar animações CSS (grid-appear, photo-in, live-pulse)
[ ] Testar responsividade (320px, 390px, 768px, 1280px, 1440px)
[ ] Garantir que botão "Criar evento" aponta para /admin/login
```

---

## Arquivos de Referência

| Arquivo | Descrição |
|---|---|
| `Landing Page.dc.html` | Protótipo completo da landing page — Turn 1 (1a Noturno · 1b Álbum), Turn 2 (2a Desktop com telão · 2b Mobile) |
| `Layout Sistema.dc.html` | Protótipos das telas do app (login, dashboard admin, upload convidado, moderação, telão) |
| `DESIGN_HANDOFF.md` (no codebase, `docs/`) | Handoff completo das telas do app com specs de componentes e Tailwind classes |
