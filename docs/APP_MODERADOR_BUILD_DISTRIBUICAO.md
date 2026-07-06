# App Moderador - Build, Testes e Distribuição

Este documento registra o plano realista para testar, gerar builds e distribuir o protótipo Expo/React Native do app de moderadores do Revela.

O app nativo é uma melhoria experimental para moderadores. Para o evento de 11/07/2026, o fluxo seguro continua sendo:

```text
QR Code dos convidados -> upload web -> moderação web -> telão -> exportação
```

Não há garantia de publicação em App Store ou Google Play sem contas, credenciais, revisão externa e validação em aparelhos reais.

## Estado Validado em 06/07/2026

Worktree auditado: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-app-build-distribution-plan`

Branch: `codex/app-build-distribution-plan`

Comandos executados:

```bash
rtk pnpm install
rtk proxy pnpm --filter @eventoon/moderator-app typecheck
rtk pnpm typecheck
rtk pnpm lint
rtk pnpm build
rtk proxy pnpm --filter @eventoon/moderator-app exec expo --version
rtk proxy pnpm --filter @eventoon/moderator-app exec expo config --type public
rtk proxy pnpm --filter @eventoon/moderator-app exec expo install --check
rtk proxy pnpm --filter @eventoon/moderator-app exec eas --version
```

Resultados:

- `pnpm --filter @eventoon/moderator-app typecheck`: passou.
- `pnpm typecheck`: passou.
- `pnpm lint`: passou com 2 warnings no app:
  - `apps/moderator/App.tsx`: dependências ausentes no `useEffect`.
  - `apps/moderator/App.tsx`: imagem sem `alt` no lint web/a11y.
- `pnpm build`: passou e incluiu as rotas `/api/moderator-app/*`.
- Expo CLI disponível via pacote: versão `57.0.4`.
- EAS CLI foi verificado na investigação como `20.5.1`, mas não ficou versionado no pacote porque a árvore transitiva adicionada ao lockfile foi bloqueada pela política `minimumReleaseAge` do `pnpm`.
- Configuração pública Expo:
  - `name`: `Revela Moderador`
  - `slug`: `revela-moderador`
  - `version`: `0.1.0`
  - `scheme`: `revela-moderador`
  - plataformas: `ios`, `android`, `web`
  - plugin: `expo-notifications`
  - `moderatorApiBaseUrl`: `http://127.0.0.1:3000` por padrão.
- Não existe `eas.json`.
- `eas-cli` não está versionado no pacote `@eventoon/moderator-app`; deve ser instalado/configurado junto com `eas.json` quando a etapa de build interno for executada.
- `expo install --check` falhou por compatibilidade esperada do Expo SDK 57:
  - instalado `react@19.2.4`; esperado `19.2.3`.
  - instalado `typescript@5.9.3`; esperado `~6.0.3`.

## O Que Pode Ser Testado Antes de Contas Apple/Google

### Typecheck e build web/backend

```bash
rtk proxy pnpm --filter @eventoon/moderator-app typecheck
rtk pnpm typecheck
rtk pnpm lint
rtk pnpm build
```

Esses comandos não exigem contas externas.

### Expo Go em ambiente local

Pré-requisitos:

1. Backend Next.js rodando.
2. Banco com dados de teste.
3. Link/token de moderador válido.
4. Celular na mesma rede do computador, ou túnel Expo quando rede local não funcionar.

Com backend local:

```bash
rtk proxy env EXPO_PUBLIC_MODERATOR_API_BASE_URL=http://<ip-da-maquina>:3000 pnpm --filter @eventoon/moderator-app start -- --host lan
```

Alternativa com túnel:

```bash
rtk proxy env EXPO_PUBLIC_MODERATOR_API_BASE_URL=https://<backend-de-teste> pnpm --filter @eventoon/moderator-app start -- --tunnel
```

O Expo Go permite validar fluxo visual, ativação por convite, listagem pendente e decisões, desde que o backend esteja acessível.

### Smoke integrado de API

Com backend Next.js, banco e dados demo:

```bash
rtk pnpm db:up
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm db:migrate
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm db:seed
rtk proxy env DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/eventoon pnpm smoke:moderator-app
```

Esse smoke valida ativação, sessão, contexto, lista pendente, detalhe, decisão, registro de push token falso e logout.

## O Que Exige Aparelho Físico

- Geração real de Expo Push Token.
- Permissões reais de notificação.
- Teste de deep link ou scheme `revela-moderador`.
- Experiência de rede em celular real.
- Performance de lista de fotos e decisão em tela pequena.

Simulador/emulador ou web podem validar parte visual e fluxo HTTP, mas não substituem teste em aparelho físico para push.

## O Que Exige Conta ou Configuração Externa

### Expo/EAS

Antes de builds distribuíveis:

1. Decidir se o projeto usará EAS.
2. Instalar/configurar `eas-cli` quando a política de supply chain permitir a árvore transitiva necessária.
3. Criar `eas.json`.
4. Criar projeto Expo/EAS e definir `extra.eas.projectId` se push for usado em build.
5. Resolver o desalinhamento apontado por `expo install --check`.

Sem isso, não tratar build nativo distribuível como pronto.

### Apple Developer

Exige:

- Conta Apple Developer ativa.
- App Identifier/bundle identifier.
- Certificados e provisioning profiles.
- Dispositivo cadastrado para Ad Hoc, se usar distribuição interna fora do TestFlight.
- App Store Connect para TestFlight.
- Revisão externa para publicação pública.

Não prometer disponibilidade em iPhone sem passos concluídos.

### Google Play Developer

Exige:

- Conta Google Play Developer ativa.
- Application ID definido.
- Keystore/assinatura.
- Track de Internal Testing, Closed Testing ou Production.
- Revisão externa conforme política vigente.

Não prometer disponibilidade em Android via Play Store sem esses passos concluídos.

## Plano Recomendado de Build

### Fase 1 - Antes de Qualquer Loja

1. Corrigir ou aceitar conscientemente os warnings de `pnpm lint`.
2. Alinhar dependências com `expo install --check`.
3. Validar `pnpm --filter @eventoon/moderator-app typecheck`.
4. Validar `pnpm build` da raiz.
5. Rodar `pnpm smoke:moderator-app` com backend/banco locais.
6. Testar em Expo Go com celular físico na mesma rede.

Resultado esperado: app útil para ensaio técnico, ainda sem promessa de distribuição formal.

### Fase 2 - Build Interno

1. Adicionar `eas.json`.
2. Configurar projeto EAS.
3. Configurar bundle identifier iOS e application ID Android.
4. Gerar build de desenvolvimento ou preview.
5. Instalar em poucos aparelhos de moderadores e validar o fluxo completo.

Resultado esperado: build interno condicionado a contas, credenciais, EAS e aparelhos disponíveis.

### Fase 3 - Distribuição por Lojas

1. Preparar metadados, ícones, screenshots, política de privacidade e textos.
2. Submeter TestFlight ou Google Play Internal Testing.
3. Aguardar revisão e corrigir exigências.
4. Só depois considerar distribuição ampla.

Resultado esperado: disponibilidade dependente de aprovação externa.

## Plano Seguro Para 11/07/2026

Para o evento de 11/07/2026:

- Usar web como caminho principal e seguro.
- Manter links web de moderadores preparados.
- Testar QR Code, upload web, moderação web, telão e exportação ZIP antes do evento.
- Tratar o app como ensaio controlado, não como dependência operacional.
- Se o app falhar, não registrar push, não instalar ou não conectar, moderadores continuam pelo link web.

Critério prático: o evento não deve depender do app nativo enquanto não houver build instalado, testado em aparelho real e validado com backend de produção ou ambiente equivalente.

## Checklist Pré-Ensaio do App

- [ ] `pnpm --filter @eventoon/moderator-app typecheck` passando.
- [ ] `pnpm build` da raiz passando.
- [ ] `expo install --check` sem incompatibilidades ou incompatibilidades aceitas formalmente.
- [ ] Backend acessível pelo celular.
- [ ] Banco com evento e moderador de teste.
- [ ] Token de moderador válido.
- [ ] Ativação no app validada.
- [ ] Lista pendente carregando.
- [ ] Aprovar/rejeitar validado.
- [ ] Web fallback validado com o mesmo moderador ou moderador reserva.
- [ ] Push testado apenas se houver aparelho físico e credenciais Expo suficientes.
- [ ] `eas.json` e projeto EAS configurados antes de tratar build nativo como distribuível.

## Riscos Conhecidos

- `eas-cli` não está versionado no pacote porque a instalação atual foi bloqueada por política de supply chain em dependência transitiva recente.
- `expo install --check` aponta desalinhamento de dependências para o SDK 57.
- Contas Apple Developer e Google Play Developer são dependências externas.
- Revisão de TestFlight/Google Play não é controlada pelo repositório.
- Push real precisa de aparelho físico, permissões e credenciais Expo/EAS.
- Para 11/07/2026, a moderação web permanece o fallback operacional obrigatório.
