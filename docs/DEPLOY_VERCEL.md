# Deploy e Vercel

Este documento registra os pontos de deploy do Revela, com foco em Vercel.

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
https://revela.vercel.app/api/auth/callback/google
```

Vantagem:

- mais rapido para testar.

Riscos:

- mistura configuracao de produtos diferentes;
- dificulta auditoria futura;
- se o OAuth Client for alterado para um app, pode afetar o outro.

### Opcao 2 - Criar um OAuth Client separado para Revela

Recomendado para o produto.

Vantagem:

- configuracao isolada;
- nome do app correto na tela de consentimento;
- menor risco de quebrar outro sistema;
- mais limpo para evoluir o Revela.

Recomendacao:

- para teste rapido, reaproveitar pode servir;
- para uso real no aniversario e deploy, criar um OAuth Client proprio para Revela.

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
- versoes WebP otimizadas sao enviadas para o bucket R2 quando o Sharp estiver disponivel;
- se o Sharp nao carregar no runtime serverless, o sistema salva a imagem original tambem como arquivo de exibicao para nao bloquear o upload;
- imagem do convite e convertida para WebP quando possivel e enviada ao R2;
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

1. Criar projeto Vercel. Concluido.
2. Configurar banco Postgres gerenciado. Concluido com Neon.
3. Rodar migrations no banco remoto. Concluido.
4. Criar bucket Cloudflare R2. Concluido.
5. Configurar `NEXTAUTH_SECRET`. Concluido.
6. Configurar `NEXTAUTH_URL`. Concluido.
7. Configurar Google OAuth. Concluido.
8. Adicionar callback de producao no Google Cloud. Concluido.
9. Configurar `ADMIN_EMAIL_ALLOWLIST`. Concluido.
10. Configurar `STORAGE_PROVIDER="cloudflare-r2"`. Concluido.
11. Configurar credenciais e URL publica do R2. Concluido com `r2.dev`.
12. Testar login admin. Concluido.
13. Criar evento de teste. Concluido.
14. Testar upload por QR Code em celular. Pendente em celular real; upload publico por API validado.
15. Testar moderacao. Concluido.
16. Testar telao. Concluido.
17. Testar exportacao ZIP. Pendente em producao.

## Dominios Planejados

- Aplicacao: `revela.gersonvan.com.br`
- Midias R2: `media.gersonvan.com.br`

No Google OAuth, o callback de producao devera ser:

```text
https://revela.gersonvan.com.br/api/auth/callback/google
```

## DNS na Locaweb

O dominio `gersonvan.com.br` esta com nameservers da Locaweb. Para apontar a aplicacao para a Vercel, crie este registro DNS na Locaweb:

```text
Tipo: CNAME
Nome/Host: revela
Valor/Destino: 0d6c9cd442647db1.vercel-dns-017.com.
```

Depois de propagar, validar com:

```bash
vercel domains verify revela.gersonvan.com.br
```

Para o dominio de midias `media.gersonvan.com.br`, o caminho ideal e configurar um custom domain no Cloudflare R2. Esse fluxo pode exigir que a zona DNS esteja no Cloudflare. Enquanto isso, o MVP pode usar a URL publica `r2.dev` do bucket.

## Estado Atual do Deploy

- Projeto Vercel: `revela`
- URL temporaria de producao: `https://revela-one.vercel.app`
- Dominio customizado ativo na Vercel: `https://revela.gersonvan.com.br`
- Certificado HTTPS emitido para `revela.gersonvan.com.br`
- Banco de producao: Neon `revela-postgres`
- Migration inicial aplicada no banco Neon.
- Storage de producao: Cloudflare R2 bucket `revela-uploads`
- URL publica atual de midias: `r2.dev` do bucket.
- Ensaio de producao em 30/06/2026: upload publico, moderacao e telao validados no evento `Ensaio Producao`.

## Cuidados de Seguranca

- `.env*` fica fora do pacote de deploy por `.vercelignore`.
- Credenciais sensiveis devem ficar nas variaveis de ambiente da Vercel, nao no repositorio.
- Como algumas credenciais foram compartilhadas durante a configuracao assistida, rotacionar Google OAuth secret, R2 access keys e tokens Cloudflare antes do evento real.
