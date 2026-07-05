# QA - Baseline Operacional - 05/07/2026

## Objetivo

Registrar o estado factual de prontidao local e de producao antes das mudancas de Fase 2, sem alterar comportamento de produto.

## Workspace

- Projeto principal: `/Users/gersonvan/Documents/EventoOn`
- Worktree auditado: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-audit-operational-baseline`
- Branch auditada: `codex/audit-operational-baseline`
- Estado inicial do Git: limpo em `codex/audit-operational-baseline`
- Estado apos validacoes e antes da documentacao: limpo

## Rotas e Superficie Verificada no Codigo

Rotas relevantes presentes no build:

- Upload publico: `/e/[slug]`
- API de upload: `/api/events/[slug]/photos`
- Feed do telao: `/api/events/[slug]/approved-photos`
- Telao: `/screen/[slug]`
- Atalho do telao: `/t/[slug]`
- Moderacao: `/moderate/[token]`
- Resumo de moderacao: `/api/moderate/[token]/summary`
- Admin: `/admin`, `/admin/login`, `/admin/events/[eventId]`, `/admin/events/new`
- Exportacao protegida: `/admin/events/[eventId]/export`
- Exportacao ZIP protegida: `/admin/events/[eventId]/export-zip`
- QR protegido: `/admin/events/[eventId]/qr-code`
- Midias locais: `/media/[...path]`

## Validacao Local

Comandos executados:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm env:check
pnpm build
```

Resultados:

- `pnpm install`: passou e instalou dependencias locais do worktree.
- `pnpm lint`: passou.
- `pnpm typecheck`: passou, sem erros TypeScript.
- `pnpm env:check`: falhou por ambiente local incompleto no worktree. Variaveis ausentes: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `pnpm build`: passou. O build Next.js 16 compilou as rotas de upload, moderacao, telao, admin, exportacao, QR e APIs.

`pnpm smoke:demo` nao foi executado porque o worktree auditado nao tem `.env` e banco local preparado. Pela documentacao, esse smoke depende de servidor local, banco e seed demo.

## Checks HTTP de Producao

Alvo: `https://revela.gersonvan.com.br`

Comandos executados com `curl` sem sessao autenticada:

| URL | Resultado | Observacao |
| --- | --- | --- |
| `/` | `HTTP 200` | Home publica disponivel. |
| `/e/ensaio-producao-kkh7uc` | `HTTP 200` | Upload publico do evento de ensaio disponivel. |
| `/screen/ensaio-producao-kkh7uc` | `HTTP 200` | Telao publico disponivel. |
| `/t/ensaio-producao-kkh7uc` | `HTTP 307` | Redireciona para `/screen/ensaio-producao-kkh7uc`. |
| `/api/events/ensaio-producao-kkh7uc/approved-photos` | `HTTP 200` | Payload contem `photos` com 2 itens no momento da auditoria. |
| `/moderate` | `HTTP 200` | Pagina base de moderacao disponivel. Nao valida token privado. |
| `/admin` | `HTTP 307` | Redireciona para `/admin/login?callbackUrl=%2Fadmin` sem sessao. |
| `/admin/login` | `HTTP 200` | Login admin disponivel. |
| `/admin/events/nonexistent/export` | `HTTP 307` | Redireciona para login sem sessao. |
| `/admin/events/nonexistent/export-zip` | `HTTP 307` | Redireciona para login sem sessao. |
| `/admin/events/nonexistent/qr-code` | `HTTP 307` | Redireciona para login sem sessao. |

## Interpretacao por Fluxo

- Upload por QR Code: pagina publica do evento de ensaio respondeu `HTTP 200`; envio real de arquivo nao foi repetido neste baseline sem ambiente autenticado/ensaio fisico.
- Moderacao: superficie publica de moderacao existe e `/moderate` responde `HTTP 200`; token real de moderador nao foi usado para evitar expor credenciais privadas.
- Telao: rota canonical e atalho curto estao disponiveis; feed aprovado responde `HTTP 200`.
- Admin: rota protegida redireciona para login sem sessao, comportamento esperado.
- Exportacao JSON/ZIP e QR: rotas protegidas redirecionam para login sem sessao, comportamento esperado; export real exige sessao admin.

## Riscos e Caveats

- A auditoria sem sessao nao substitui ensaio autenticado completo: criar/ativar evento, usar moderador privado, aprovar foto real e baixar ZIP real.
- O worktree nao possui `.env`; validacoes de banco, OAuth e storage real dependem de configurar ambiente local antes de rodar `pnpm env:check` e `pnpm smoke:demo`.
- O evento de 11/07/2026 ainda precisa de teste fisico com celular real no local ou rede equivalente.
- `media.gersonvan.com.br` segue como dominio planejado; enquanto nao estiver configurado, a producao depende da URL publica atual do R2.
- Credenciais sensiveis mencionadas na documentacao anterior devem ser rotacionadas antes do evento real, conforme `docs/DEPLOY_VERCEL.md`.

## Conclusao

O baseline sem sessao mostra codigo compilando, lint/typecheck passando, home/upload/telao/feed publico disponiveis em producao e protecao de admin/export/QR redirecionando corretamente para login. As lacunas restantes sao de ambiente autenticado e ensaio operacional real, nao de compilacao ou disponibilidade publica basica.
