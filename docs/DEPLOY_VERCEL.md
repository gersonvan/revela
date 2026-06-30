# Deploy e Vercel

Este documento registra os pontos de deploy do EventoOn, com foco em Vercel.

## Relacao entre Google OAuth e Vercel

O Vercel normalmente guarda as variaveis de ambiente do app.

O Google Cloud e onde fica o OAuth Client real.

Na pratica:

- `GOOGLE_CLIENT_ID` vem do Google Cloud.
- `GOOGLE_CLIENT_SECRET` vem do Google Cloud.
- `NEXTAUTH_URL` deve ser a URL publica do deploy.
- No Google Cloud, a URL de callback precisa apontar para o dominio do app.

## Reaproveitar configuracao existente

Se ja existir uma configuracao usada em outro sistema, como um sistema pessoal de gastos, existem duas opcoes.

### Opcao 1 - Reaproveitar o mesmo OAuth Client

Possivel, desde que o Google Cloud permita adicionar mais uma URI de callback autorizada.

Exemplo local:

```text
http://localhost:3000/api/auth/callback/google
```

Exemplo Vercel:

```text
https://eventoon.vercel.app/api/auth/callback/google
```

Vantagem:

- mais rapido para testar.

Riscos:

- mistura configuracao de produtos diferentes;
- dificulta auditoria futura;
- se o OAuth Client for alterado para um app, pode afetar o outro.

### Opcao 2 - Criar um OAuth Client separado para EventoOn

Recomendado para o produto.

Vantagem:

- configuracao isolada;
- nome do app correto na tela de consentimento;
- menor risco de quebrar outro sistema;
- mais limpo para evoluir o EventoOn.

Recomendacao:

- para teste rapido, reaproveitar pode servir;
- para uso real no aniversario e deploy, criar um OAuth Client proprio para EventoOn.

## Variaveis no Vercel

Configurar no projeto Vercel:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL_ALLOWLIST=
STORAGE_PROVIDER=
BLOB_READ_WRITE_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
```

Exemplo:

```bash
NEXTAUTH_URL="https://revela.gersonvan.com.br"
ADMIN_EMAIL_ALLOWLIST="voce@gmail.com,moderador-admin@gmail.com"
STORAGE_PROVIDER="cloudflare-r2"
```

`ADMIN_EMAIL_ALLOWLIST` e opcional em desenvolvimento, mas deve ser preenchida em producao para impedir que qualquer conta Google valida acesse o admin.

Em desenvolvimento local, com `STORAGE_PROVIDER="local"`, as variaveis do R2 podem ficar vazias.

## Banco e Storage no Deploy

O MVP local usa:

- Postgres via Docker;
- arquivos em `storage/`.

Para Vercel, isso precisa mudar:

- banco Postgres gerenciado;
- storage de objetos para imagens.

Opcoes recomendadas:

- Postgres: Neon, Supabase ou Vercel Postgres;
- Storage: Cloudflare R2.

O adapter recomendado `cloudflare-r2` ja esta implementado. Para ativar no deploy, configure:

```bash
STORAGE_PROVIDER="cloudflare-r2"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_BASE_URL="https://media.gersonvan.com.br"
```

Com esse provider:

- fotos originais sao enviadas para o bucket R2;
- versoes WebP otimizadas sao enviadas para o bucket R2;
- imagem do convite e convertida para WebP e enviada ao R2;
- o banco guarda URLs publicas do R2;
- exportacao ZIP baixa as imagens pelas URLs gravadas no banco.

As URLs do R2 precisam ser publicas para o telao e as paginas carregarem imagens diretamente no navegador. Para producao, a recomendacao e usar um dominio proprio como `media.gersonvan.com.br`. Enquanto esse dominio nao estiver configurado, a URL publica `r2.dev` do bucket pode ser usada para teste.

Nao ha galeria publica no MVP. Apenas fotos aprovadas entram no telao; pendentes e rejeitadas continuam acessiveis apenas por admin/moderacao/exportacao.

O adapter `vercel-blob` tambem existe como alternativa, mas nao e o caminho recomendado atual.

## Adapter de Storage

O codigo da aplicacao deve importar storage por:

```ts
import { ... } from "@/lib/storage";
```

A implementacao local fica em:

```text
src/lib/storage/local.ts
```

A implementacao Vercel Blob fica em:

```text
src/lib/storage/vercel-blob.ts
```

A implementacao Cloudflare R2 fica em:

```text
src/lib/storage/cloudflare-r2.ts
```

Isso deixa detalhes do provider concentrados na camada `src/lib/storage`, sem espalhar integracao pelas rotas e actions.

## Checklist de Deploy

1. Criar projeto Vercel.
2. Configurar banco Postgres gerenciado.
3. Rodar migrations no banco remoto.
4. Criar bucket Cloudflare R2.
5. Configurar `NEXTAUTH_SECRET`.
6. Configurar `NEXTAUTH_URL`.
7. Configurar Google OAuth.
8. Adicionar callback de producao no Google Cloud.
9. Configurar `ADMIN_EMAIL_ALLOWLIST`.
10. Configurar `STORAGE_PROVIDER="cloudflare-r2"`.
11. Configurar credenciais e URL publica do R2.
12. Testar login admin.
13. Criar evento de teste.
14. Testar upload por QR Code em celular.
15. Testar moderacao.
16. Testar telao.
17. Testar exportacao ZIP.

## Dominios Planejados

- Aplicacao: `revela.gersonvan.com.br`
- Midias R2: `media.gersonvan.com.br`

No Google OAuth, o callback de producao devera ser:

```text
https://revela.gersonvan.com.br/api/auth/callback/google
```
