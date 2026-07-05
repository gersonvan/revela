# Status de Implementação

## Estado atual

MVP web funcional publicado e validado em produção. A Fase 2 está em preparação para o evento de 11/07/2026 e deve preservar o fluxo web já validado.

## Já implementado e validado

- aplicação Next.js com App Router;
- TypeScript;
- Tailwind CSS;
- ESLint;
- Prisma 7;
- adapter PostgreSQL do Prisma;
- Auth.js/NextAuth com Google Provider;
- allowlist opcional de e-mails autorizados para o admin;
- schema inicial do banco;
- migration SQL inicial;
- docker-compose para PostgreSQL local;
- middleware de proteção das rotas admin;
- tela de login admin com Google;
- listagem de eventos do admin;
- formulário de criação de evento;
- detalhe de evento com links operacionais;
- ativação e encerramento de evento;
- página pública do evento em `/e/[slug]`;
- formulário mobile para envio de fotos;
- API de upload de fotos por evento;
- validação de evento ativo, nome, quantidade, tamanho, tipo de arquivo e mensagem;
- armazenamento local de fotos originais em desenvolvimento;
- geração de versão otimizada WebP com Sharp;
- rota `/media/...` para servir arquivos armazenados localmente;
- criação de fotos como `PENDING` para moderação;
- criação de links secretos individuais de moderador pelo admin;
- armazenamento do token de moderador como hash;
- ativação de link de moderador com vínculo por cookie de dispositivo;
- tela `/moderate/[token]` com abas Pendentes, Aprovadas e Rejeitadas;
- ações de aprovar, rejeitar e restaurar fotos rejeitadas;
- registro de decisões de moderação em `ModerationDecision`;
- tela pública `/screen/[slug]`;
- atalho curto `/t/[slug]` para abrir o telão;
- QR Code no detalhe admin do evento;
- links absolutos de upload e telão no admin;
- formulário admin de configurações do evento;
- dashboard admin com contadores de fotos por status;
- dashboard admin com moderadores usados versus criados;
- upload de imagem do convite pelo admin;
- otimização da imagem do convite para WebP;
- limite de Server Actions ajustado para upload de convite de até 20 MB;
- endpoint de resumo da moderação;
- polling simples no painel de moderação;
- alerta visual quando novas fotos chegam para moderação;
- revogação de moderadores pelo admin;
- exportação JSON protegida do evento com fotos, moderadores e histórico de moderação;
- exportação ZIP protegida do evento com `metadata.json`, fotos originais e versões otimizadas;
- documentação de configuração Google OAuth;
- documentação de deploy/Vercel e reaproveitamento de OAuth existente;
- camada pública `src/lib/storage` criada para isolar implementação local de storage;
- adapter `vercel-blob` para storage online;
- adapter `cloudflare-r2` para storage online recomendado;
- fallback no adapter `cloudflare-r2` para enviar imagem original quando Sharp não estiver disponível no runtime serverless;
- `.vercelignore` para evitar envio de `.env*` e artefatos locais no pacote de deploy;
- script `pnpm env:check` para validar variáveis obrigatórias;
- script `pnpm db:seed` para criar evento e moderador demo local;
- script `pnpm smoke:demo` para ensaio automatizado do fluxo local;
- aviso na tela de login quando credenciais Google OAuth não estiverem configuradas;
- página inicial simples do Revela;
- scripts de validação e build.

## Stack efetiva

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- PostgreSQL via `@prisma/adapter-pg`
- NextAuth 4 com Google Provider
- Sharp
- QRCode
- pnpm

## Comandos validados

```bash
pnpm prisma generate
pnpm validate
pnpm env:check
pnpm build
```

Status registrado:

- `pnpm prisma generate`: passando.
- `pnpm validate`: passando.
- `pnpm env:check`: passando.
- `pnpm build`: passando.
- `pnpm db:up`: passando.
- `pnpm db:migrate`: passando.
- Upload API: testada com imagem PNG local e registro `Photo` criado como `PENDING`.
- Moderação: link de teste ativado, foto pendente aprovada e decisão registrada no banco.
- Telão: `/screen/evento-teste` verificado no navegador com foto aprovada, mensagem, QR Code e botão de tela cheia.
- Telão vazio: `/screen/evento-sem-fotos` verificado no navegador com imagem de convite e QR Code.
- Painel de moderação: rota verificada no navegador após ativação do link, com abas e sem erros de console.
- Exportação JSON: rota protegida validada com redirecionamento para login quando sem sessão admin.
- Exportação ZIP: rota protegida validada com redirecionamento para login quando sem sessão admin.
- Smoke demo: valida páginas demo, upload, foto pendente e feed do telão com foto aprovada.
- Smoke demo após adapter de storage: passando com `STORAGE_PROVIDER=local`.
- Validação de ambiente R2: quando `STORAGE_PROVIDER=cloudflare-r2`, `pnpm env:check` exige todas variáveis `R2_*`.
- R2 real: upload de foto validado no bucket `revela-uploads`; URL pública `r2.dev` retornou `HTTP 200` para imagem WebP otimizada.
- Vercel: projeto `revela` criado e deploy de produção publicado.
- Domínio `revela.gersonvan.com.br`: CNAME configurado, HTTPS emitido e rotas principais validadas.
- Banco de produção: Neon `revela-postgres`, com migration inicial aplicada.
- R2 em produção: upload validado no bucket `revela-uploads`; URL pública `r2.dev` usada enquanto `media.gersonvan.com.br` não estiver configurado.
- Login real com Google: validado em `http://127.0.0.1:3000/admin` com `gersonvan@gmail.com`.
- Fluxo autenticado completo: evento `Ensaio Revela` criado pelo admin, ativado, moderador criado e ativado, foto enviada por API pública, aprovada e exibida no telão.
- Ensaio de produção em 30/06/2026: upload público, moderação, telão e exportação ZIP validados no evento `Ensaio Producao`.

## Em planejamento para Fase 2

- Modo de moderação por evento.
- Upload com aprovação automática quando a moderação estiver desativada.
- Aviso claro no admin quando fotos puderem aparecer diretamente no telão.
- Histórico para identificar aprovação automática.
- Melhorias mobile na moderação web.
- Base de aplicativo nativo para moderadores com Expo/React Native.
- Convite por e-mail para moderadores no app.
- Registro de dispositivo ou sessão de moderador.
- Notificações push agrupadas ou limitadas.
- Prova isolada com vídeos de 5 a 10 segundos.
- Documentação de custos e retenção de originais para vídeo.

## Fora do escopo de implementação atual

- Cobrança e planos com enforcement real.
- Aplicativo nativo para convidados.
- Vídeo no fluxo público de upload do evento.
- IA de moderação.
- Reconhecimento facial.
- Back office SaaS comercial completo.
- Garantia de publicação em App Store ou Google Play.

## Variáveis de ambiente

Arquivo de referência:

```bash
.env.example
```

Variáveis atuais:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL_ALLOWLIST`
- `STORAGE_PROVIDER`
- `BLOB_READ_WRITE_TOKEN`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

## Observações

- O Prisma Client é gerado em `src/generated/prisma`, mas esse diretório não deve ser versionado.
- O script `postinstall` executa `prisma generate`.
- O `.env` local foi criado para desenvolvimento e está ignorado pelo Git.
- `ADMIN_EMAIL_ALLOWLIST` local está preenchida com `gersonvan@gmail.com`.
- `STORAGE_PROVIDER` local está como `cloudflare-r2` para validar o R2 real.
- `BLOB_READ_WRITE_TOKEN` fica vazio no desenvolvimento local e é obrigatório quando `STORAGE_PROVIDER=vercel-blob`.
- Variáveis `R2_*` são obrigatórias quando `STORAGE_PROVIDER=cloudflare-r2`.
- Domínio da aplicação: `revela.gersonvan.com.br`.
- Domínio planejado de mídias: `media.gersonvan.com.br`.
- Registro DNS na Locaweb: CNAME `revela` para `0d6c9cd442647db1.vercel-dns-017.com.`.
- Enquanto `media.gersonvan.com.br` não estiver configurado, o MVP usa URL pública `r2.dev` do bucket.
- Validação de 30/06/2026: `media.gersonvan.com.br` ainda não possui CNAME; o bucket `revela-uploads` ainda não possui custom domain conectado; a zona `gersonvan.com.br` ainda não existe na conta Cloudflare do bucket.
- Componentes visuais devem seguir os tokens do design system como fonte única.

## Auditoria QA - 05/07/2026

Baseline operacional registrado em `docs/QA-2026-07-05-baseline-operacional.md`.

Resumo do estado atual:

- Worktree auditado: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-audit-operational-baseline`.
- Branch auditada: `codex/audit-operational-baseline`.
- `pnpm install`: concluído para preparar dependências locais do worktree.
- `pnpm lint`: passando.
- `pnpm typecheck`: passando.
- `pnpm build`: passando.
- `pnpm env:check`: bloqueado no worktree por ausência de `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
- Produção `https://revela.gersonvan.com.br/`: `HTTP 200`.
- Upload público `https://revela.gersonvan.com.br/e/ensaio-producao-kkh7uc`: `HTTP 200`.
- Telão `https://revela.gersonvan.com.br/screen/ensaio-producao-kkh7uc`: `HTTP 200`.
- Atalho de telão `https://revela.gersonvan.com.br/t/ensaio-producao-kkh7uc`: `HTTP 307` para `/screen/ensaio-producao-kkh7uc`.
- Feed público `https://revela.gersonvan.com.br/api/events/ensaio-producao-kkh7uc/approved-photos`: `HTTP 200`, payload com chave `photos` e 2 itens no momento da auditoria.
- Admin `/admin`: `HTTP 307` para `/admin/login?callbackUrl=%2Fadmin` sem sessão, comportamento esperado.
- Login admin `/admin/login`: `HTTP 200`.
- Exportação JSON, ZIP e QR protegidos sob `/admin/events/...`: `HTTP 307` para login sem sessão, comportamento esperado.

Riscos atuais para o evento de 11/07/2026:

- Validação autenticada de admin, moderação real por token privado, exportação real de evento e upload físico por celular ainda exigem sessão/credenciais ou ensaio operacional fora deste baseline sem sessão.
- O worktree auditado não possui `.env`; validações que dependem de banco, OAuth ou storage real precisam de ambiente configurado antes de novo smoke local.
- `media.gersonvan.com.br` segue planejado; enquanto não for configurado, o fluxo depende da URL pública atual do R2 registrada no ambiente de produção.

## Próxima fase

Fase 2 - ensaio operacional e acabamento.

Próximas tarefas recomendadas:

1. Fazer ensaio físico em celular real via QR Code usando `https://revela.gersonvan.com.br/e/ensaio-producao-kkh7uc`.
2. Decidir se o DNS de `gersonvan.com.br` será migrado para Cloudflare para habilitar `media.gersonvan.com.br` no R2.
3. Rotacionar credenciais sensíveis antes de usar no evento real.
4. Fazer revisão fina mobile/desktop com o design system Revela.
5. Implementar modo de moderação por evento sem afetar o fluxo web já validado.
