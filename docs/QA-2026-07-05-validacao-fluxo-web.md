# QA - Validação do Fluxo Web - 05/07/2026

## Objetivo

Validar o fluxo web após a implementação de modo de moderação por evento, com foco em upload com e sem moderação, histórico automático, limite de seleção de fotos, fallback web de moderação e prontidão para deploy.

## Workspace

- Projeto principal: `/Users/gersonvan/Documents/EventoOn`
- Worktree auditado: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-validate-web-flow`
- Branch auditada: `codex/validate-web-flow`
- Estado inicial do Git: limpo em `codex/validate-web-flow`
- Deploy realizado nesta tarefa: não

## Arquivos Inspecionados

- `prisma/schema.prisma`
- `prisma/migrations/20260705090000_add_event_moderation_mode/migration.sql`
- `prisma/migrations/20260705093000_add_auto_approved_moderation_history/migration.sql`
- `src/app/admin/events/[eventId]/page.tsx`
- `src/app/admin/events/actions.ts`
- `src/app/api/events/[slug]/photos/route.ts`
- `src/components/upload/photo-upload-form.tsx`
- `src/app/moderate/[token]/page.tsx`
- `src/components/moderation/bulk-moderation-actions.tsx`
- `scripts/smoke-moderation-mode.mjs`
- `docs/STATUS_IMPLEMENTACAO.md`
- `docs/QA-2026-07-05-baseline-operacional.md`
- `docs/OPERACAO_EVENTO.md`

## Validação Local

Comandos executados:

```bash
rtk pnpm install
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm build
rtk pnpm env:check
rtk docker compose up -d postgres
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm db:migrate
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm smoke:moderation-mode
```

Resultados:

- `pnpm install`: passou.
- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm build`: passou.
- `pnpm env:check`: falhou porque o worktree não tem `.env` local. Variáveis ausentes: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `docker compose up -d postgres`: falhou porque o Docker daemon não estava disponível em `unix:///Users/gersonvan/.docker/run/docker.sock`.
- `pnpm db:migrate`: falhou por indisponibilidade do Postgres local.
- `pnpm smoke:moderation-mode`: falhou com `ECONNREFUSED 127.0.0.1:5432`.

## Modo Com Moderação

Evidência de código:

- O schema define `EventModerationMode.WITH_MODERATION` e `Event.moderationMode` com default `WITH_MODERATION`.
- A rota `POST /api/events/[slug]/photos` lê `event.moderationMode`.
- Quando `moderationMode` é `WITH_MODERATION`, `shouldAutoApprove` é falso e a foto é criada com `PhotoStatus.PENDING`.
- O script `scripts/smoke-moderation-mode.mjs` cobre esse comportamento ao mudar o evento demo para `WITH_MODERATION`, fazer upload e exigir status `PENDING`.

Status: validado por inspeção de código e coberto por smoke script, mas não executado localmente por falta de Postgres.

## Modo Sem Moderação

Evidência de código:

- Quando `moderationMode` é `WITHOUT_MODERATION`, `shouldAutoApprove` é verdadeiro e a foto é criada com `PhotoStatus.APPROVED`.
- A mesma transação cria `ModerationDecision` com `action: AUTO_APPROVED`, `previousStatus: PENDING`, `newStatus: APPROVED` e sem `moderatorId`.
- O script `scripts/smoke-moderation-mode.mjs` cobre upload sem moderação, status `APPROVED`, histórico `AUTO_APPROVED`, `moderatorId` nulo e presença da foto no feed aprovado.

Status: validado por inspeção de código e coberto por smoke script, mas não executado localmente por falta de Postgres.

## Histórico Automático e Remoção Posterior

Evidência:

- A migration `20260705093000_add_auto_approved_moderation_history` adiciona `AUTO_APPROVED`, torna `ModerationDecision.moderatorId` opcional e usa `ON DELETE SET NULL`.
- A página de moderação continua listando fotos por status.
- Cards aprovados continuam exibindo ação de rejeição como `Remover do telão`, o que permite remover fotos aprovadas automaticamente.
- A ação em lote afeta somente fotos pendentes; não altera fotos aprovadas ou rejeitadas.

## Limite de 15 Fotos

Evidência de código:

- `src/components/upload/photo-upload-form.tsx` define `MAX_FILES = 15`.
- O cálculo `availableSlots = MAX_FILES - photos.length` evita exceder o limite considerando a seleção já existente.
- Quando o usuário tenta adicionar mais arquivos do que as vagas disponíveis, o código retorna antes de chamar `setPhotos`; a seleção válida existente é preservada.
- A mensagem em português informa: limite de 15 fotos, quantidade já selecionada e que a seleção foi mantida.

Tentativa de validação no navegador:

- Upload público de produção carregou com input `image/*`, `multiple`, autorização, menção ao limite 15 e botão `Enviar para moderação`.
- A automação do navegador in-app não expôs `File`, `atob` ou método de upload de arquivos no wrapper usado, então não foi possível simular uma seleção real sem envio.

Status: validado por inspeção de código; validação interativa de seleção ficou limitada pela ferramenta.

## Fallback Web de Moderação

Evidência:

- `/moderate` em produção respondeu `HTTP 200`.
- A página `src/app/moderate/[token]/page.tsx` continua sendo o fallback web para moderadores.
- O layout usa classes responsivas como `px-3`, `sm:px-5`, `grid`, `sm:grid-cols-2` e `lg:grid-cols-3`, preservando operação web em telas menores.
- Sem token privado de moderador, não foi feita validação autenticada da tela real de moderação.
- O navegador in-app usado nesta validação não permitiu configurar viewport mobile; a viewport disponível foi `1280x720`.

Status: fallback web confirmado por rota pública e inspeção de código; validação mobile autenticada em dimensão real ainda pendente.

## Checks HTTP de Produção

Nenhum deploy foi realizado nesta tarefa. Os checks abaixo validam a produção atual sem sessão:

| URL | Resultado | Observação |
| --- | --- | --- |
| `/` | `HTTP 200` | Home pública disponível. |
| `/e/ensaio-producao-kkh7uc` | `HTTP 200` | Upload público disponível. |
| `/api/events/ensaio-producao-kkh7uc/approved-photos` | `HTTP 200` | Payload contém `photos` com 2 itens no momento da validação. |
| `/admin` | `HTTP 307` | Redireciona para `/admin/login?callbackUrl=%2Fadmin` sem sessão. |
| `/admin/login` | `HTTP 200` | Login admin disponível. |

## Riscos Restantes

- Rodar `pnpm smoke:moderation-mode` em ambiente com Docker/Postgres ativo ou banco local disponível.
- Fazer ensaio autenticado de admin para alternar `Com moderação` e `Sem moderação` em evento real/de teste.
- Validar upload real em celular com mais de 15 imagens para confirmar a experiência fora da inspeção de código.
- Validar painel `/moderate/[token]` com token privado em viewport mobile real.
- Confirmar deploy antes de tratar o modo sem moderação como disponível em produção.

## Conclusão

O código da branch `codex/validate-web-flow` está compilando e cobre os comportamentos esperados de moderação com e sem aprovação humana. O bloqueio principal é operacional: não havia Docker/Postgres local para executar o smoke de banco e upload, e não houve sessão/token privado para validação autenticada. Nenhum deploy foi realizado.
