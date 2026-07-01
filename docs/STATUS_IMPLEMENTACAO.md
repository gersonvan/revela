# Status de Implementacao

## Estado Atual

MVP funcional publicado e validado em producao.

Ja foi criado:

- aplicacao Next.js com App Router;
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
- middleware de protecao das rotas admin;
- tela de login admin com Google;
- listagem de eventos do admin;
- formulario de criacao de evento;
- detalhe de evento com links operacionais;
- ativacao e encerramento de evento;
- pagina publica do evento em `/e/[slug]`;
- formulario mobile para envio de fotos;
- API de upload de fotos por evento;
- validacao de evento ativo, nome, quantidade, tamanho, tipo de arquivo e mensagem;
- armazenamento local de fotos originais em desenvolvimento;
- geracao de versao otimizada WebP com Sharp;
- rota `/media/...` para servir arquivos armazenados localmente;
- criacao de fotos como `PENDING` para moderacao;
- criacao de links secretos individuais de moderador pelo admin;
- armazenamento do token de moderador como hash;
- ativacao de link de moderador com vinculo por cookie de dispositivo;
- tela `/moderate/[token]` com abas Pendentes, Aprovadas e Rejeitadas;
- acoes de aprovar, rejeitar e restaurar fotos rejeitadas;
- registro de decisoes de moderacao em `ModerationDecision`;
- tela publica `/screen/[slug]`;
- atalho curto `/t/[slug]` para abrir o telao;
- QR Code no detalhe admin do evento;
- links absolutos de upload e telao no admin;
- formulario admin de configuracoes do evento;
- dashboard admin com contadores de fotos por status;
- dashboard admin com moderadores usados versus criados;
- upload de imagem do convite pelo admin;
- otimizacao da imagem do convite para WebP;
- limite de Server Actions ajustado para upload de convite de ate 20 MB;
- endpoint de resumo da moderacao;
- polling simples no painel de moderacao;
- alerta visual quando novas fotos chegam para moderacao;
- revogacao de moderadores pelo admin;
- exportacao JSON protegida do evento com fotos, moderadores e historico de moderacao;
- exportacao ZIP protegida do evento com `metadata.json`, fotos originais e versoes otimizadas;
- documentacao de configuracao Google OAuth;
- documentacao de deploy/Vercel e reaproveitamento de OAuth existente;
- camada publica `src/lib/storage` criada para isolar implementacao local de storage;
- adapter `vercel-blob` para storage online;
- adapter `cloudflare-r2` para storage online recomendado;
- fallback no adapter `cloudflare-r2` para enviar imagem original quando Sharp nao estiver disponivel no runtime serverless;
- `.vercelignore` para evitar envio de `.env*` e artefatos locais no pacote de deploy;
- script `pnpm env:check` para validar variaveis obrigatorias;
- script `pnpm db:seed` para criar evento e moderador demo local;
- script `pnpm smoke:demo` para ensaio automatizado do fluxo local;
- aviso na tela de login quando credenciais Google OAuth nao estiverem configuradas;
- pagina inicial simples do Revela;
- scripts de validacao e build.

## Stack Efetiva

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

## Comandos Validados

```bash
pnpm prisma generate
pnpm validate
pnpm env:check
pnpm build
```

Status:

- `pnpm prisma generate`: passando.
- `pnpm validate`: passando.
- `pnpm env:check`: passando.
- `pnpm build`: passando.
- `pnpm db:up`: passando.
- `pnpm db:migrate`: passando.
- Upload API: testada com imagem PNG local e registro `Photo` criado como `PENDING`.
- Moderacao: link de teste ativado, foto pendente aprovada e decisao registrada no banco.
- Telao: `/screen/evento-teste` verificado no navegador com foto aprovada, mensagem, QR Code e botao de tela cheia.
- Telao vazio: `/screen/evento-sem-fotos` verificado no navegador com imagem de convite e QR Code.
- Painel de moderacao: rota verificada no navegador apos ativacao do link, com abas e sem erros de console.
- Exportacao JSON: rota protegida validada com redirecionamento para login quando sem sessao admin.
- Exportacao ZIP: rota protegida validada com redirecionamento para login quando sem sessao admin.
- Smoke demo: valida paginas demo, upload, foto pendente e feed do telao com foto aprovada.
- Smoke demo apos adapter de storage: passando com `STORAGE_PROVIDER=local`.
- Validacao de ambiente R2: quando `STORAGE_PROVIDER=cloudflare-r2`, `pnpm env:check` exige todas variaveis `R2_*`.
- R2 real: upload de foto validado no bucket `revela-uploads`; URL publica `r2.dev` retornou `HTTP 200` para imagem WebP otimizada.
- Vercel: projeto `revela` criado e deploy de producao publicado.
- Dominio `revela.gersonvan.com.br`: CNAME configurado, HTTPS emitido e rotas principais validadas.
- Banco de producao: Neon `revela-postgres`, com migration inicial aplicada.
- R2 em producao: upload validado no bucket `revela-uploads`; URL publica `r2.dev` usada enquanto `media.gersonvan.com.br` nao estiver configurado.
- Login real com Google: validado em `http://127.0.0.1:3000/admin` com `gersonvan@gmail.com`.
- Fluxo autenticado completo: evento `Ensaio Revela` criado pelo admin, ativado, moderador criado e ativado, foto enviada por API publica, aprovada e exibida no telao.
- Ensaio de producao em 30/06/2026: upload publico, moderacao, telao e exportacao ZIP validados no evento `Ensaio Producao`.

## Variaveis de Ambiente

Arquivo de referencia:

```bash
.env.example
```

Variaveis atuais:

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

## Observacoes

- O Prisma Client e gerado em `src/generated/prisma`, mas esse diretorio nao deve ser versionado.
- O script `postinstall` executa `prisma generate`.
- O `.env` local foi criado para desenvolvimento e esta ignorado pelo Git.
- `ADMIN_EMAIL_ALLOWLIST` local esta preenchida com `gersonvan@gmail.com`.
- `STORAGE_PROVIDER` local esta como `cloudflare-r2` para validar o R2 real.
- `BLOB_READ_WRITE_TOKEN` fica vazio no desenvolvimento local e e obrigatorio quando `STORAGE_PROVIDER=vercel-blob`.
- Variaveis `R2_*` sao obrigatorias quando `STORAGE_PROVIDER=cloudflare-r2`.
- Dominio da aplicacao: `revela.gersonvan.com.br`.
- Dominio planejado de midias: `media.gersonvan.com.br`.
- Registro DNS na Locaweb: CNAME `revela` para `0d6c9cd442647db1.vercel-dns-017.com.`.
- Enquanto `media.gersonvan.com.br` nao estiver configurado, o MVP usa URL publica `r2.dev` do bucket.
- Validacao de 30/06/2026: `media.gersonvan.com.br` ainda nao possui CNAME; o bucket `revela-uploads` ainda nao possui custom domain conectado; a zona `gersonvan.com.br` ainda nao existe na conta Cloudflare do bucket.
- Componentes visuais devem seguir os tokens do design system como fonte unica.

## Proxima Fase

Fase 2 - Ensaio operacional e acabamento.

Proximas tarefas recomendadas:

1. Fazer ensaio fisico em celular real via QR Code usando `https://revela.gersonvan.com.br/e/ensaio-producao-kkh7uc`.
2. Decidir se o DNS de `gersonvan.com.br` sera migrado para Cloudflare para habilitar `media.gersonvan.com.br` no R2.
3. Rotacionar credenciais sensiveis antes de usar no evento real.
4. Fazer revisao fina mobile/desktop com o design system Revela.
