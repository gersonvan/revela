# API do App Moderador

Este contrato cobre o backend mínimo para o protótipo Expo/React Native do app de moderadores. O upload dos convidados, a moderação web, o telão e as exportações continuam disponíveis como fluxo seguro de produção.

## Autenticação

O app ativa uma sessão própria usando o token de convite do moderador:

`POST /api/moderator-app/sessions`

```json
{
  "inviteToken": "token-do-convite",
  "deviceId": "uuid-do-dispositivo",
  "platform": "ios",
  "appVersion": "1.0.0",
  "deviceName": "iPhone"
}
```

Resposta `201`:

```json
{
  "sessionToken": "token-de-sessao",
  "moderator": { "id": "mod_123", "name": "Ana" },
  "event": {
    "id": "evt_123",
    "name": "Aniversário",
    "moderationMode": "WITH_MODERATION"
  }
}
```

Depois da ativação, enviar `Authorization: Bearer <sessionToken>` em todas as chamadas. O app deve armazenar apenas o token de sessão, não o token de convite.

## Contexto

`GET /api/moderator-app/me`

Retorna moderador, evento, contadores por status e permissões disponíveis. O evento sempre é derivado da sessão; o cliente nunca envia `eventId`.

## Fotos

`GET /api/moderator-app/photos?status=PENDING&limit=30&cursor=<photoId>`

Status aceitos: `PENDING`, `APPROVED`, `REJECTED`. O padrão é `PENDING`. A resposta inclui `items`, `nextCursor` e `counts`.

`GET /api/moderator-app/photos/{photoId}`

Retorna uma foto somente se ela pertencer ao evento do moderador autenticado.

## Decisão

`POST /api/moderator-app/photos/{photoId}/decision`

```json
{ "nextStatus": "APPROVED" }
```

Valores aceitos: `APPROVED` e `REJECTED`. A decisão atualiza `Photo` e cria `ModerationDecision` na mesma transação. Se a foto já foi alterada por outra sessão, a API retorna `409` e o app deve recarregar a lista.

## Push Token

`PUT /api/moderator-app/push-token`

```json
{
  "pushToken": "ExponentPushToken[...]",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

Resposta `204`. Esta etapa apenas persiste o token na sessão do app; não há envio de push nesta fase.

## Encerrar Sessão

`DELETE /api/moderator-app/sessions/current`

Revoga a sessão atual e remove o push token associado. O app deve apagar o token local após sucesso ou erro `401`.

## Caveats

- Sessões expiram em 30 dias.
- Moderador revogado bloqueia web e app.
- O app nativo é melhoria experimental; para o evento de 11/07/2026, a moderação web segue como fallback operacional.
- Tokens de convite, sessão e push não devem ser registrados em logs.
