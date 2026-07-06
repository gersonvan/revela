# App Moderador

Protótipo Expo/React Native para moderadores do Revela. O app ativa uma sessão pelo convite individual do moderador, consulta o contexto do evento, lista fotos pendentes e envia decisões de aprovar ou rejeitar usando `/api/moderator-app/*`.

O app não implementa upload de convidados. O fluxo seguro de convidados continua sendo QR Code web, upload web, moderação web, telão e exportação.

## Configuração

Instale as dependências na raiz do repositório:

```bash
pnpm install
```

Defina a URL do backend local ou de teste:

```bash
EXPO_PUBLIC_MODERATOR_API_BASE_URL=http://127.0.0.1:3000
```

No simulador iOS, `127.0.0.1` aponta para a máquina host. Em aparelho físico, use o IP da máquina na rede local, por exemplo:

```bash
EXPO_PUBLIC_MODERATOR_API_BASE_URL=http://192.168.0.10:3000
```

## Rodar

Com o backend Next.js rodando:

```bash
pnpm --filter @eventoon/moderator-app start
```

Depois, abra no Expo Go ou em um dev build e cole o token/link de convite de um moderador.

## Validação

```bash
pnpm --filter @eventoon/moderator-app typecheck
```

Para validar o fluxo integrado, o backend precisa estar rodando com banco e dados de teste. O smoke do backend continua disponível na raiz:

```bash
pnpm smoke:moderator-app
```

## Limitações

- Push token é registrado apenas quando o moderador toca em `Ativar` na área de alertas. Web, simuladores/emuladores, permissão negada ou ausência de credenciais Expo são tratados como indisponíveis e não bloqueiam a moderação.
- O backend persiste o token com `PUT /api/moderator-app/push-token`, mas ainda não envia notificações nesta fase.
- O protótipo usa sessão via `expo-secure-store` em iOS/Android e fallback em memória no web.
- Não há distribuição por App Store ou Google Play nesta fase.
- A moderação web segue como fallback operacional.

## Comportamento de alertas agrupados

O comportamento planejado para envio futuro é agrupado e sem dados sensíveis na tela bloqueada:

- agrupar novas fotos pendentes por evento em janelas curtas, por exemplo 1 a 3 minutos;
- limitar reenvios em períodos de pico para não saturar moderadores;
- usar texto genérico, como `Novas fotos aguardam moderação`;
- não incluir foto, nome do convidado, mensagem ou token na notificação;
- abrir a lista pendente do evento ao tocar no alerta;
- manter pull-to-refresh, app de moderação e web fallback funcionando mesmo quando push falhar.

Este protótipo só registra o token do aparelho. O dispatch agrupado deve ser implementado depois como job/backend isolado e sem serviço pago obrigatório.
