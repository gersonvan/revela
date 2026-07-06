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

- Push token ainda não é registrado pelo app; o backend já possui rota para persistência futura.
- O protótipo usa sessão via `expo-secure-store` em iOS/Android e fallback em memória no web.
- Não há distribuição por App Store ou Google Play nesta fase.
- A moderação web segue como fallback operacional.
