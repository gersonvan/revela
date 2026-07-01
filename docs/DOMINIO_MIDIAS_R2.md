# Dominio de Midias R2

Este documento registra o caminho para trocar a URL publica temporaria do R2 por `media.gersonvan.com.br`.

## Estado Atual

- Dominio da aplicacao: `revela.gersonvan.com.br`.
- Dominio desejado para midias: `media.gersonvan.com.br`.
- DNS autoritativo de `gersonvan.com.br`: Locaweb.
- Bucket R2: `revela-uploads`.
- URL publica atual: `https://pub-718538e86bcd4003b2a7d496ad3dbb6a.r2.dev`.
- Custom domains conectados ao bucket: nenhum.
- Zona `gersonvan.com.br` na conta Cloudflare atual: nao encontrada.

## Restricao da Cloudflare

Para conectar um custom domain ao R2, o dominio precisa existir como zona na mesma conta Cloudflare do bucket.

Nao usar CNAME direto de `media.gersonvan.com.br` para o subdominio `r2.dev`. A documentacao da Cloudflare trata `r2.dev` como URL publica de desenvolvimento e nao recomenda esse caminho para producao.

## Caminho Recomendado

Migrar o DNS autoritativo de `gersonvan.com.br` para Cloudflare.

Passos:

1. Adicionar `gersonvan.com.br` como site/zona na conta Cloudflare que contem o bucket `revela-uploads`.
2. Copiar para Cloudflare todos os registros DNS atuais da Locaweb antes de trocar nameservers.
3. Garantir que `revela.gersonvan.com.br` continue apontando para Vercel:

```text
Tipo: CNAME
Nome: revela
Destino: 0d6c9cd442647db1.vercel-dns-017.com.
Proxy: DNS only
```

4. Trocar os nameservers do dominio na Locaweb para os nameservers informados pela Cloudflare.
5. Aguardar a zona ficar `Active` na Cloudflare.
6. Conectar o bucket ao dominio:

```bash
wrangler r2 bucket domain add revela-uploads \
  --domain media.gersonvan.com.br \
  --zone-id <ZONE_ID> \
  --min-tls 1.2 \
  --force
```

7. Confirmar que o dominio ficou ativo:

```bash
wrangler r2 bucket domain list revela-uploads
curl -I https://media.gersonvan.com.br/<caminho-de-uma-imagem-existente>
```

8. Atualizar a variavel no Vercel:

```bash
R2_PUBLIC_BASE_URL=https://media.gersonvan.com.br
```

9. Fazer novo deploy do Revela.
10. Enviar uma foto de teste, aprovar e confirmar que o telao carrega a imagem por `media.gersonvan.com.br`.

## Alternativa Sem Migrar DNS

Manter a Locaweb como DNS autoritativo so e viavel com setup parcial/CNAME da Cloudflare, que depende de plano Business ou Enterprise.

Nesse caminho:

1. Criar uma zona parcial para `gersonvan.com.br` na Cloudflare.
2. Adicionar o TXT de verificacao exigido pela Cloudflare na Locaweb.
3. Conectar `media.gersonvan.com.br` ao bucket R2.
4. Criar na Locaweb o CNAME apontando para o hostname `cdn.cloudflare.net` indicado pela Cloudflare.

Para o MVP, esse caminho tende a ser menos simples e mais caro que migrar o DNS autoritativo para Cloudflare.

## Validacoes Atuais

Comandos executados em 30/06/2026:

```bash
dig +short NS gersonvan.com.br
dig +short CNAME media.gersonvan.com.br
dig +short CNAME revela.gersonvan.com.br
wrangler r2 bucket domain list revela-uploads
```

Resultados:

- `gersonvan.com.br` usa `ns1.locaweb.com.br`, `ns2.locaweb.com.br`, `ns3.locaweb.com.br`.
- `media.gersonvan.com.br` nao possui CNAME publicado.
- `revela.gersonvan.com.br` aponta para Vercel.
- `revela-uploads` nao possui custom domain conectado.
