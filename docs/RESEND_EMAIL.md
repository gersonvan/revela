# Envio de E-mail com Resend

O Revela pode enviar convites de moderação diretamente pelo sistema usando Resend.

## O que já está implementado

- Campo opcional de e-mail no formulário de criação de moderador.
- Registro do e-mail no cadastro do moderador.
- Envio automático do convite quando Resend estiver configurado.
- Fallback com link completo caso o envio não esteja configurado ou falhe.

## Variáveis de ambiente

Configurar no Vercel:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="Revela <convites@seudominio.com.br>"
EMAIL_REPLY_TO="seu-email@seudominio.com.br"
```

`EMAIL_REPLY_TO` é opcional.

## Domínio

O Resend exige uma API key e um domínio verificado para envio em produção.

Passos:

1. Criar conta em Resend.
2. Adicionar o dominio remetente no painel do Resend.
3. Copiar os registros DNS gerados pelo Resend.
4. Criar esses registros na Locaweb.
5. Aguardar o Resend marcar o dominio como verificado.
6. Criar uma API key.
7. Configurar `RESEND_API_KEY`, `EMAIL_FROM` e `EMAIL_REPLY_TO` no Vercel.
8. Fazer novo deploy.
9. Criar um moderador com e-mail e confirmar o recebimento do convite.

## Modelo de convite

Assunto:

```text
Convite para moderar fotos - Nome do Evento
```

Corpo:

```text
Olá, Nome.

Você foi convidado para moderar as fotos do evento "Nome do Evento" no Revela.

Acesse o link individual:
https://revela.gersonvan.com.br/moderate/...

Esse link deve ser usado apenas por você.
```

## Comportamento esperado

- Se `RESEND_API_KEY` e `EMAIL_FROM` estiverem configurados, o sistema tenta enviar o e-mail.
- Se faltarem variáveis, o moderador ainda é criado e o link completo aparece na tela.
- Se o envio falhar, o moderador ainda é criado e o link completo aparece como fallback.
