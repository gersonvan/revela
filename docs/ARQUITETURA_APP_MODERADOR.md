# Arquitetura do App Moderador

Este documento define a direção técnica para um app nativo de moderação do Revela. O escopo é um app Expo/React Native para moderadores convidados, com autorização por evento, registro de sessão/dispositivo, lista de fotos pendentes, decisão de aprovar ou rejeitar e notificações push agrupadas.

O app nativo para convidados fica fora deste escopo. O envio por QR Code, o upload web, o painel web de moderação, o telão e as exportações continuam sendo o fluxo seguro de produção.

## Objetivos

- Permitir que um moderador convidado revise fotos pelo celular com menos atrito do que no navegador.
- Reaproveitar o modelo atual de moderadores por evento, token secreto e histórico de decisões.
- Preservar isolamento por evento em todas as consultas e ações.
- Manter o painel web `/moderate/[token]` como fallback operacional para o evento de 11/07/2026.
- Evitar dependências pagas novas enquanto o app estiver em validação.

## Não objetivos

- Criar app nativo para convidados enviarem fotos.
- Substituir o painel web de moderação no curto prazo.
- Publicar imediatamente em App Store ou Google Play.
- Expor fotos pendentes ou rejeitadas em qualquer rota pública.
- Implementar processamento de vídeo, IA de moderação ou reconhecimento facial.

## Estado atual reaproveitado

O sistema web já possui a base necessária para autorizar moderadores de forma escopada:

- `Moderator` guarda `eventId`, `name`, `email`, `tokenHash`, `status`, `deviceId`, `activatedAt`, `lastAccessAt` e `revokedAt`.
- O link secreto do moderador é criado pelo admin e o token completo aparece apenas no momento de criação.
- Quando há e-mail, o convite pode ser enviado pelo Resend; se o envio não estiver configurado, o admin recebe um link/manual mailto.
- O token é salvo no banco apenas como hash.
- O acesso web atual ativa o moderador no primeiro uso e grava um `deviceId` em cookie HTTP-only.
- A tela web consulta fotos sempre com `eventId` do moderador.
- Ações individuais e em lote registram `ModerationDecision` com `moderatorId`, `previousStatus`, `newStatus` e `action`.
- O evento possui `moderationMode`: com moderação, uploads entram como `PENDING`; sem moderação, uploads entram como `APPROVED` e registram `AUTO_APPROVED`.

## Estrutura recomendada do app Expo

O app deve ser um projeto Expo/React Native separado do Next.js, mas no mesmo repositório ou em pacote próprio versionado junto da Fase 2. Estrutura sugerida:

```text
apps/moderator/
  app/
    login.tsx
    events.tsx
    moderation/
      [eventId]/index.tsx
      [eventId]/photo/[photoId].tsx
  src/
    api/client.ts
    api/moderation.ts
    auth/session-store.ts
    notifications/register-push-token.ts
    components/
    state/
```

Responsabilidades:

- `api/client.ts`: cliente HTTP com base URL configurável e tratamento uniforme de erro.
- `auth/session-store.ts`: armazenamento seguro do token de sessão do app, preferencialmente com `expo-secure-store`.
- `notifications/register-push-token.ts`: registro e atualização de Expo Push Token quando disponível.
- telas em `app/`: fluxo visual do moderador.

## Fluxo de acesso por convite

1. Admin cria o moderador pelo painel do evento com nome e, idealmente, e-mail.
2. Sistema cria token secreto, salva apenas `tokenHash` e envia ou exibe o link de convite.
3. Moderador abre o link no celular.
4. Link pode abrir o app por deep link, quando instalado, ou cair no fallback web.
5. App envia o token de convite para uma API de ativação.
6. API valida hash, status e evento, cria uma sessão de app vinculada ao moderador e registra metadados do dispositivo.
7. App armazena apenas o token de sessão retornado, não o token de convite original.

Para reduzir risco operacional, o token de convite deve continuar de uso controlado. Depois da ativação, chamadas do app devem usar sessão própria revogável, e não repetir o token completo do convite em cada request.

## Sessão e dispositivo

O web atual usa `deviceId` em cookie. Para o app, a recomendação é evoluir para uma sessão explícita de moderador, mantendo compatibilidade conceitual com o vínculo por dispositivo.

Modelo futuro sugerido:

```text
ModeratorSession
  id
  moderatorId
  tokenHash
  deviceId
  platform
  appVersion
  pushToken
  createdAt
  lastSeenAt
  expiresAt
  revokedAt
```

Regras:

- sessão pertence a um único `Moderator`;
- toda chamada deriva `eventId` pelo `Moderator`, nunca por parâmetro confiado do cliente;
- sessão expirada, revogada ou de moderador revogado retorna `401`;
- moderador revogado no admin invalida o acesso do app;
- `lastSeenAt` pode ser atualizado em chamadas autenticadas;
- token de sessão deve ser exibido em logs apenas como hash ou prefixo mascarado.

Enquanto esse modelo não existir no banco, o contrato abaixo deve ser tratado como proposta de implementação futura.

## Fluxo de dados

```text
Admin cria moderador -> convite individual -> app ativa sessão -> API deriva evento pelo moderador -> app lista fotos pendentes -> moderador decide -> Photo muda de status -> ModerationDecision registra histórico -> telão consome apenas aprovadas
```

Detalhes importantes:

- o upload dos convidados continua no web público e grava fotos no evento pelo `publicSlug`;
- em eventos com moderação, a foto nasce como `PENDING` e entra na fila do app;
- em eventos sem moderação, a foto nasce como `APPROVED`, registra `AUTO_APPROVED` e não precisa passar pelo app;
- a lista do app nunca recebe `eventId` confiado do cliente, porque o backend deriva o evento pela sessão do moderador;
- a decisão do app atualiza a foto e grava histórico na mesma transação;
- o telão e as rotas públicas continuam lendo somente fotos aprovadas.

## Contrato de API proposto

Todas as rotas devem ser servidas pelo Next.js e responder JSON. A autenticação do app deve usar `Authorization: Bearer <sessionToken>` após ativação.

### Ativar convite

`POST /api/moderator-app/sessions`

Entrada:

```json
{
  "inviteToken": "token-do-link",
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
  "moderator": {
    "id": "mod_123",
    "name": "Ana"
  },
  "event": {
    "id": "evt_123",
    "name": "Casamento",
    "moderationMode": "WITH_MODERATION"
  }
}
```

Erros esperados:

- `400`: token ausente ou formato inválido;
- `401`: token inexistente;
- `403`: moderador revogado ou link já vinculado a outro dispositivo;
- `409`: convite já ativado quando a política permitir apenas uma sessão.

### Consultar contexto

`GET /api/moderator-app/me`

Retorna o moderador autenticado, evento associado, contadores por status e permissões habilitadas.

Uso:

- restaurar sessão ao abrir o app;
- validar se o moderador ainda está ativo;
- detectar troca de modo de moderação.

### Listar fotos pendentes

`GET /api/moderator-app/photos?status=PENDING&cursor=<cursor>&limit=30`

Resposta:

```json
{
  "items": [
    {
      "id": "photo_123",
      "guestName": "Maria",
      "message": "Parabéns!",
      "imageUrl": "https://...",
      "uploadedAt": "2026-07-05T12:00:00.000Z",
      "status": "PENDING"
    }
  ],
  "nextCursor": null,
  "counts": {
    "pending": 4,
    "approved": 20,
    "rejected": 2
  }
}
```

Regras:

- a consulta deve filtrar por `eventId` do moderador autenticado;
- o app pode listar `PENDING` por padrão;
- `APPROVED` e `REJECTED` podem ser úteis para desfazer erro, mas não são necessários para o MVP nativo;
- `imageUrl` deve apontar para versão otimizada quando existir.

### Detalhar foto

`GET /api/moderator-app/photos/{photoId}`

Retorna os mesmos dados da lista, com metadados adicionais se necessários para revisão. A rota deve usar `findFirst` ou filtro equivalente por `id` e `eventId`; nunca buscar apenas por `photoId`.

### Moderar foto

`POST /api/moderator-app/photos/{photoId}/decision`

Entrada:

```json
{
  "nextStatus": "APPROVED"
}
```

Valores aceitos: `APPROVED` e `REJECTED`.

Resposta:

```json
{
  "photoId": "photo_123",
  "previousStatus": "PENDING",
  "newStatus": "APPROVED",
  "action": "APPROVED",
  "pendingCount": 3
}
```

Regras:

- aprovar foto pendente registra `APPROVED`;
- rejeitar foto pendente registra `REJECTED`;
- rejeitar foto aprovada deve ser tratado como remoção do telão, mantendo ação compatível com o histórico atual;
- restaurar foto rejeitada para aprovada pode ficar fora do MVP do app e continuar disponível no web fallback;
- a decisão deve ser transacional: atualizar `Photo` e criar `ModerationDecision` juntos.

### Registrar push token

`PUT /api/moderator-app/push-token`

Entrada:

```json
{
  "pushToken": "ExponentPushToken[...]",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

Resposta `204` sem corpo.

Regras:

- push token pertence à sessão/dispositivo, não ao evento público;
- token deve ser removido ou ignorado quando sessão for revogada;
- falha de push não pode impedir upload nem moderação web.

### Encerrar sessão

`DELETE /api/moderator-app/sessions/current`

Revoga a sessão atual e remove o push token associado. O app deve apagar o token local após sucesso ou erro `401`.

## Telas e estados

### Convite e login

Estados:

- abrindo link de convite;
- token inválido;
- convite já ativado em outro dispositivo;
- moderador revogado;
- ativação concluída;
- fallback para abrir no navegador.

### Contexto do evento

Mostra nome do evento, nome do moderador e contagem de pendentes. Não precisa listar múltiplos eventos no MVP, porque o convite atual é individual por evento.

### Lista pendente

Mostra cartões com foto otimizada, nome do convidado, mensagem opcional e horário de envio. Deve suportar pull-to-refresh, paginação simples e estado vazio.

### Revisão de foto

Pode ser uma tela de detalhe ou um card expandido. A ação principal deve ser aprovar; a ação destrutiva deve ser rejeitar. Após decisão, o item sai da fila pendente e o app mostra confirmação discreta.

### Resultado, erro e conflito

Estados necessários:

- ação enviada;
- ação concluída;
- foto já moderada por outra sessão;
- sessão expirada;
- sem internet;
- erro do servidor com tentativa novamente.

Em conflito, o app deve recarregar a lista e não repetir a decisão automaticamente.

## Notificações push

O objetivo é avisar moderadores sobre novas fotos sem vazar conteúdo sensível.

Comportamento recomendado:

- agrupar novas fotos por evento em janelas curtas, por exemplo 1 a 3 minutos;
- limitar frequência para evitar spam durante pico de upload;
- texto de lock screen sem imagem, nome de convidado ou mensagem;
- exemplo: `Novas fotos aguardam moderação`;
- ao tocar, abrir a lista pendente do evento;
- se push falhar, manter polling/refresh manual no app e fallback web.

Infraestrutura de baixo custo:

- usar Expo Notifications durante prova e distribuição interna;
- armazenar Expo Push Token por sessão;
- enviar notificações por job simples no backend apenas quando houver fotos novas pendentes;
- evitar serviço pago de mensageria enquanto volume e necessidade real não forem comprovados.

## Segurança e dados

- Todas as rotas do app devem derivar o evento pelo moderador autenticado.
- Cliente não pode escolher `eventId` para consultar ou moderar.
- Fotos `PENDING` e `REJECTED` nunca devem aparecer no telão, upload público ou rotas públicas.
- Revogação no admin deve bloquear web e app.
- Tokens de convite, sessão e push não devem aparecer em logs.
- URLs de imagem devem respeitar o mesmo modelo de acesso já usado pelo web; se o bucket estiver público para mídia aprovada, avaliar cuidadosamente o risco de URLs de pendentes antes de expor ao app.
- O app deve armazenar sessão em armazenamento seguro do dispositivo.
- A API deve retornar respostas genéricas para token inválido, evitando revelar se um e-mail ou moderador existe.

## Distribuição e testes

Pode ser testado agora:

- fluxo visual no Expo Go ou dev build;
- chamadas locais contra Next.js em ambiente de desenvolvimento;
- ativação com token de moderador demo;
- lista e decisão usando banco local;
- registro de Expo Push Token em ambiente de teste;
- fallback manual para painel web.

Exige contas ou configuração externa:

- build iOS para dispositivo físico fora do Expo Go;
- TestFlight e distribuição ampla para iPhone;
- Google Play Internal Testing para Android;
- certificados, perfis e revisão das lojas;
- garantia de entrega push em produção.

Para o evento de 11/07/2026, o app nativo deve ser tratado como melhoria controlada. A operação segura continua sendo:

```text
QR Code de convidados -> upload web -> moderação web -> telão -> exportação
```

Se o app não estiver instalado, aprovado, conectado ou validado, moderadores devem usar o link web existente.

## Sequência incremental sugerida

1. Criar rotas JSON de sessão, contexto, lista pendente e decisão, ainda sem app.
2. Validar as rotas com seed local e smoke tests de escopo por evento.
3. Criar dev build Expo com login por convite e lista pendente.
4. Adicionar aprovar/rejeitar com tratamento de conflito.
5. Registrar push token sem enviar notificações.
6. Adicionar agrupamento de notificações em ambiente de teste.
7. Decidir distribuição interna após validar contas Apple/Google e aparelhos dos moderadores.

## Critérios de aceite para implementação futura

- Moderador revogado não acessa app nem web.
- Sessão de app não consegue consultar fotos de outro evento.
- Aprovar ou rejeitar cria histórico com `moderatorId`.
- Foto pendente aprovada aparece no telão; rejeitada não aparece.
- App funciona sem push, usando refresh manual.
- Web fallback continua disponível e documentado para operação.
