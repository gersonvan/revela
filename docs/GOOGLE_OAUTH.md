# Configuracao Google OAuth

Este documento descreve como configurar o login Google do admin no EventoOn.

## Variaveis Necessarias

No `.env` local:

```bash
NEXTAUTH_URL="http://127.0.0.1:3000"
NEXTAUTH_SECRET="replace-with-a-random-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
ADMIN_EMAIL_ALLOWLIST=""
```

Para gerar um segredo local:

```bash
openssl rand -base64 32
```

## Google Cloud Console

1. Acesse o Google Cloud Console.
2. Crie ou selecione um projeto.
3. Configure a tela de consentimento OAuth.
4. Crie uma credencial do tipo OAuth Client ID.
5. Tipo de aplicativo: Web application.
6. Adicione a URL de callback autorizada:

```text
http://localhost:3000/api/auth/callback/google
```

Se estiver usando `127.0.0.1` no `NEXTAUTH_URL`, use:

```text
http://127.0.0.1:3000/api/auth/callback/google
```

7. Copie `Client ID` para `GOOGLE_CLIENT_ID`.
8. Copie `Client Secret` para `GOOGLE_CLIENT_SECRET`.
9. Reinicie o servidor local.

## Restricao de Admins

Por padrao, se `ADMIN_EMAIL_ALLOWLIST` estiver vazia, qualquer conta Google valida consegue acessar o painel admin. Isso facilita desenvolvimento local, mas nao e o ideal para uso real.

Para restringir o acesso, preencha a variavel com e-mails separados por virgula:

```bash
ADMIN_EMAIL_ALLOWLIST="voce@gmail.com,outra-pessoa@gmail.com"
```

Quando essa lista estiver preenchida:

- apenas esses e-mails conseguem fazer login;
- sessoes antigas de e-mails fora da lista deixam de acessar o admin;
- o cadastro na tabela `Admin` so e criado para e-mails autorizados.

## Se ja existir uma configuracao antiga

Se houver um OAuth Client usado por outro sistema, como um sistema pessoal de gastos, verifique:

- se ele esta no Google Cloud;
- quais callbacks autorizados ele possui;
- se o Vercel daquele sistema apenas guarda as variaveis de ambiente;
- se faz sentido adicionar o callback do EventoOn ao mesmo client.

Para teste rapido, e possivel reaproveitar.

Para o EventoOn como produto, e melhor criar um OAuth Client separado.

## Teste Local

Com o Postgres rodando:

```bash
pnpm db:up
pnpm db:migrate
pnpm dev
```

Depois acesse:

```text
http://127.0.0.1:3000/admin/login
```

Ao entrar com Google, o sistema cria ou atualiza o admin na tabela `Admin`.

Se `ADMIN_EMAIL_ALLOWLIST` estiver preenchida, esse cadastro so acontece para e-mails autorizados.

Antes do teste, valide as variaveis:

```bash
pnpm env:check
```

Se o comando indicar falta de `GOOGLE_CLIENT_ID` ou `GOOGLE_CLIENT_SECRET`, ainda e necessario buscar essas credenciais no Google Cloud ou no projeto Vercel antigo.

## Observacoes

- O login Google e obrigatorio para o admin.
- `ADMIN_EMAIL_ALLOWLIST` deve ser preenchida antes de usar o sistema em evento real.
- Moderadores continuam usando link secreto individual.
- Convidados continuam sem login.
- Em producao, o callback deve usar o dominio real:

```text
https://dominio-do-produto.com/api/auth/callback/google
```
