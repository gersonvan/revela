# QA - Smoke Final de Produção - 06/07/2026

## Objetivo

Registrar a última checagem prática de prontidão antes do evento de 11/07/2026, separando o que está validado, o que está bloqueado por ambiente/sessão e o que deve permanecer fora do caminho crítico.

## Workspace

- Projeto principal: `/Users/gersonvan/Documents/EventoOn`
- Worktree auditado: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-final-smoke-production-checks`
- Branch auditada: `codex/final-smoke-production-checks`
- Deploy realizado nesta tarefa: não

## Comandos Locais

Comandos executados:

```bash
rtk pnpm install
rtk pnpm typecheck
rtk pnpm build
rtk proxy pnpm --filter @eventoon/moderator-app typecheck
rtk pnpm lint
rtk pnpm env:check
rtk proxy pnpm --filter @eventoon/moderator-app exec eas --version
rtk docker compose up -d postgres
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm db:migrate
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm smoke:moderation-mode
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm smoke:moderator-app
node scripts/video-proof.mjs --help
```

Resultados:

- `pnpm install`: passou.
- `pnpm typecheck`: passou.
- `pnpm build`: passou. O build incluiu rotas web principais, admin/export/QR, screen/upload APIs e `/api/moderator-app/*`.
- `pnpm --filter @eventoon/moderator-app typecheck`: passou.
- `pnpm lint`: passou com 2 warnings conhecidos em `apps/moderator/App.tsx`:
  - dependências ausentes no `useEffect`;
  - aviso de `Image` sem `alt` pelo lint web/a11y.
- `pnpm env:check`: falhou porque o worktree não tem `.env` local. Variáveis ausentes: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
- `pnpm --filter @eventoon/moderator-app exec eas --version`: falhou porque `eas` não está versionado nesta branch.
- `docker compose up -d postgres`: falhou porque o Docker daemon não estava disponível em `unix:///Users/gersonvan/.docker/run/docker.sock`.
- `pnpm db:migrate`: falhou por Postgres local indisponível.
- `pnpm smoke:moderation-mode`: falhou com `ECONNREFUSED 127.0.0.1:5432`.
- `pnpm smoke:moderator-app`: falhou com `ECONNREFUSED 127.0.0.1:5432`.
- `node scripts/video-proof.mjs --help`: passou e confirmou que a prova de vídeo exige arquivo de entrada, FFmpeg e FFprobe.

## Checks de Produção Sem Sessão

Alvo: `https://revela.gersonvan.com.br`

| URL | Resultado | Interpretação |
| --- | --- | --- |
| `/` | `HTTP 200` | Home pública disponível. |
| `/e/ensaio-producao-kkh7uc` | `HTTP 200` | Upload público do evento de ensaio disponível. |
| `/screen/ensaio-producao-kkh7uc` | `HTTP 200` | Telão público disponível. |
| `/t/ensaio-producao-kkh7uc` | `HTTP 307` | Redireciona para `/screen/ensaio-producao-kkh7uc`. |
| `/api/events/ensaio-producao-kkh7uc/approved-photos` | `HTTP 200` | Payload contém chave `photos` com 2 itens no momento do smoke. |
| `/admin` | `HTTP 307` | Redireciona para login sem sessão, comportamento esperado. |
| `/admin/login` | `HTTP 200` | Login admin disponível. |
| `/admin/events/nonexistent/export` | `HTTP 307` | Exportação JSON protegida por login. |
| `/admin/events/nonexistent/export-zip` | `HTTP 307` | Exportação ZIP protegida por login. |
| `/admin/events/nonexistent/qr-code` | `HTTP 307` | QR protegido por login. |
| `/moderate` | `HTTP 200` | Página base de moderação disponível. Não valida token privado. |

Nenhum token de moderador, cookie de sessão, e-mail privado ou credencial foi usado ou registrado.

## Estado por Fluxo

### Guest Upload

Status: validado parcialmente.

- A rota pública de upload do evento respondeu `HTTP 200`.
- O build validou a rota de upload `/api/events/[slug]/photos`.
- Upload real de arquivo em produção não foi repetido neste smoke para evitar criação de dados sem necessidade.

### Modos de Moderação

Status: validado por build e inspeção anterior; smoke de banco bloqueado.

- A implementação já foi documentada em `docs/QA-2026-07-05-validacao-fluxo-web.md`.
- O smoke `pnpm smoke:moderation-mode` existe, mas não rodou por falta de Postgres local.
- Para 11/07/2026, se usar `Sem moderação`, fazer ensaio autenticado antes, porque essa opção publica direto no telão.

### Moderação Web Mobile

Status: fallback disponível; validação autenticada pendente.

- `/moderate` respondeu `HTTP 200`.
- A página `/moderate/[token]` mantém layout responsivo por código, com espaçamentos adaptativos e cards por status.
- Sem token privado, não foi validada fila real em aparelho ou viewport mobile autenticada.

### Telão

Status: validado parcialmente.

- `/screen/ensaio-producao-kkh7uc` respondeu `HTTP 200`.
- `/t/ensaio-producao-kkh7uc` redirecionou corretamente para o telão.
- O feed aprovado respondeu `HTTP 200` e retornou 2 fotos no momento do smoke.

### Exportação JSON/ZIP e QR

Status: proteção validada; export real pendente de sessão admin.

- Rotas protegidas de JSON, ZIP e QR redirecionaram para login sem sessão.
- Download real de ZIP/export exige sessão admin válida e deve ser ensaiado antes do evento.

### App Moderador

Status: protótipo validado em typecheck; não é dependência operacional do evento.

- `pnpm --filter @eventoon/moderator-app typecheck` passou.
- O build raiz incluiu `/api/moderator-app/*`.
- `eas` não está versionado neste worktree.
- O plano de distribuição segue documentado em `docs/APP_MODERADOR_BUILD_DISTRIBUICAO.md`.
- App Store/Google Play continuam dependentes de EAS, contas, credenciais, aparelho físico e revisão externa.

### Vídeo

Status: prova controlada, fora do caminho crítico de produção.

- `node scripts/video-proof.mjs --help` passou.
- Não existe `storage/video-proof/` com amostra local neste worktree, então a prova não foi reexecutada.
- `docs/PROVA_VIDEO_CONTROLADA.md` mantém vídeo fora do fluxo de produção de 11/07/2026.

## Itens Pendentes Antes de 11/07/2026

- Ensaiar login admin com sessão real.
- Criar ou ativar os links de moderadores que serão usados no evento.
- Validar QR Code e upload real em celular no local ou em rede equivalente.
- Validar aprovar/rejeitar no link real de moderador.
- Validar exportação ZIP com sessão admin e evento real.
- Confirmar que o telão abre em tela cheia no notebook, TV ou projetor do evento.
- Manter app nativo e vídeo fora do caminho crítico.

## Recomendação Final

Para o evento de 11/07/2026, a recomendação operacional é usar exclusivamente o fluxo web como caminho crítico:

```text
QR Code -> upload web -> moderação web -> telão -> exportação ZIP
```

O sistema passou nas validações locais sem banco (`typecheck`, `build`, typecheck do app) e nos checks públicos de produção sem sessão. A liberação final ainda depende de ensaio autenticado e físico, especialmente admin, moderador, ZIP e celular real.
