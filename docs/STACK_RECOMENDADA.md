# Stack Recomendada

Este documento recomenda uma stack inicial para construir o MVP do Revela.

## Recomendacao Principal

Para o MVP, a recomendacao e usar:

- **Next.js** para aplicacao web full-stack;
- **TypeScript** para reduzir erros em regras e dados;
- **PostgreSQL** para metadados;
- **Prisma** como ORM;
- **Storage de objetos** para imagens;
- **Auth.js com Google Provider** para login do admin;
- **Server-Sent Events ou polling curto** para tempo real inicial;
- **Tailwind CSS** para UI responsiva;
- **Sharp** para otimizacao de imagens.

## Por que essa stack

### Next.js

Adequado porque o produto precisa de:

- paginas publicas por evento;
- painel admin;
- paginas mobile para convidado e moderador;
- rotas de API;
- renderizacao web responsiva;
- deploy simples em nuvem.

### TypeScript

Ajuda a manter consistentes:

- status de evento;
- status de foto;
- permissoes;
- payloads de upload;
- eventos de tempo real.

### PostgreSQL

Boa escolha para:

- relacionamentos entre admin, eventos, fotos e moderadores;
- historico de moderacao;
- dashboard com contadores;
- evolucao futura para produto multi-evento.

### Prisma

Facilita:

- modelagem inicial;
- migrations;
- consultas tipadas;
- manutencao do schema.

### Storage de Objetos

Fotos nao devem ficar no banco.

Opcoes:

- Cloudflare R2;
- AWS S3;
- Supabase Storage;
- Vercel Blob.

Para MVP, escolher o servico que reduzir mais friccao de configuracao e deploy.

### Sharp

Necessario para:

- gerar versao otimizada para telao;
- corrigir orientacao;
- reduzir peso das imagens;
- evitar usar arquivos originais de ate 20 MB no feed.

### Tempo Real

Para o MVP, evitar complexidade desnecessaria.

Ordem recomendada:

1. Polling curto simples.
2. Server-Sent Events se o polling ficar limitado.
3. WebSocket somente se houver necessidade real.

Polling curto pode ser suficiente porque:

- o evento e privado;
- o numero de usuarios simultaneos tende a ser controlado;
- reduz complexidade inicial;
- e mais facil de hospedar.

## Arquitetura Inicial Recomendada

```text
Convidado Mobile
  -> Pagina publica de upload
  -> API de upload
  -> Storage de imagens
  -> Banco de metadados

Moderador Mobile
  -> Painel de moderacao
  -> API de fotos pendentes
  -> API de decisoes

Telao
  -> Pagina publica de feed
  -> API de fotos aprovadas
  -> Imagens otimizadas

Admin
  -> Painel admin
  -> API de eventos, moderadores e dashboard
```

## Deploy Inicial

Opcoes recomendadas:

### Opcao A - Vercel + Postgres + Storage

Boa para velocidade.

Componentes:

- Vercel para Next.js;
- Vercel Postgres, Neon ou Supabase Postgres;
- Vercel Blob, Supabase Storage ou Cloudflare R2.

### Opcao B - Railway/Render + Postgres + Storage

Boa se o processamento de imagem precisar de mais controle.

Componentes:

- Railway ou Render para app;
- Postgres gerenciado;
- Cloudflare R2 ou S3.

## Recomendacao para o Primeiro Build

Comecar com:

- Next.js App Router;
- TypeScript;
- Prisma;
- PostgreSQL local;
- storage local em desenvolvimento;
- provider de storage configuravel por variavel de ambiente;
- polling curto para moderacao e telao.

Depois, adaptar para storage em nuvem e deploy.

## Decisoes a Confirmar Antes do Codigo

- Provedor de deploy.
- Provedor de banco.
- Provedor de storage.
- Confirmar credenciais OAuth do Google para o login admin.
- Se uploads vao primeiro para backend ou direto para storage.

## Decisao Recomendada para MVP

Para reduzir risco:

- upload passa pelo backend no MVP;
- backend valida arquivo e cria registro;
- imagem original vai para storage;
- imagem otimizada e gerada no servidor;
- foto entra como pendente;
- telao usa apenas imagem otimizada.
