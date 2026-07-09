APM_RULES {

## Production Safety

- Preserve the existing production web flow unless the assigned task explicitly changes it.
- Do not break guest upload by QR Code, admin login, moderator access, screen display, or ZIP/export flows while working on Fase 2.
- Keep native app and video proof work isolated from the production event flow unless the task explicitly asks for integration.
- Treat `https://revela.gersonvan.com.br` as the production target for user-facing validation.

## Validation

- Before marking implementation work complete, run the strongest relevant validation available for the touched area.
- For Next.js web changes, prefer `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- For documentation-only changes, verify the edited files render as coherent Markdown and have no obviously truncated sections.
- For production-impacting changes, include a concise smoke-check summary with exact commands or URLs checked.
- If a validation cannot be run, state why and identify the remaining risk.

## Continuous Delivery

- Keep changes small enough to review, commit, push, and deploy continuously when they affect user-facing behavior.
- Do not bundle unrelated refactors with event-readiness work.
- If deploying, confirm the production deploy completes and record the resulting URL or domain check.
- Use `main` as the base branch for APM work unless the user changes it.
- Use `codex/<short-description>` branches for APM Worker tasks.
- Use short imperative commit messages, matching the existing repository history.
- Version APM planning and coordination artifacts in `.apm/` for this project.

## Documentation Language

- Write user-facing and operational documentation in clear Brazilian Portuguese with accents.
- Keep operational runbooks suitable for a non-technical operator.
- Separate completed behavior, planned behavior, blocked work, and deferred ideas clearly.

## Cost Discipline

- Prefer existing infrastructure and free or low-cost services.
- Do not introduce a new paid dependency, paid managed service, or recurring cost without explicitly documenting the need and tradeoff.
- For storage, push, video processing, or app build/distribution choices, surface cost implications before treating an option as the preferred path.

## Native App Boundaries

- The native app work is focused first on moderators.
- Do not expand native app scope to guest upload unless explicitly assigned.
- Do not claim App Store or Google Play availability is guaranteed; account setup and review are external dependencies.
- Keep web moderation as the safe fallback for the 2026-07-11 event.

## Video Proof Boundaries

- Video work in this phase is a controlled proof, not a production guest upload feature.
- Do not wire video into the live event flow unless explicitly assigned.
- Keep any video processing experiment isolated, reproducible, and cost-aware.
- Document how originals are handled in any video proof: retained temporarily, discarded, or reserved for a future paid option.

## Data And Access Safety

- Preserve event scoping for admin, moderator, app, and API access.
- Do not expose pending or rejected photos through public screen or guest flows.
- Keep moderator actions auditable where the task changes photo state.
- Avoid logging secrets, tokens, private e-mails, or storage credentials.

## Working In The Repository

- Respect existing user or agent changes. Do not revert files you did not intentionally change.
- Use existing project patterns before adding new abstractions.
- Keep generated artifacts out of Git unless the repository already tracks that artifact type or the task explicitly requires it.
- Prefer focused edits in the files owned by the assigned task.

## Build Android remoto (servidor de build)

O app `apps/moderator` usa Expo/EAS com build local executado num servidor remoto,
não no cloud EAS Build (fila de espera > 1h no plano atual).

**Infraestrutura:**
- Servidor: Debian, acessível via Tailscale em `100.78.149.56` (usuário `gersonvan`)
- Repo clonado em `~/build/revela` no servidor, sempre a partir da branch `main`
- Script de build: `~/build/build.sh [profile]` (profile padrão: `preview`)
- Autenticação EAS via `EXPO_TOKEN` já configurada em `~/.build_env` no servidor —
  não deve ser regerada nem exposta em nenhum arquivo versionado
- Monorepo pnpm: o script instala dependências na raiz antes de buildar o subpacote

**Perfis (`apps/moderator/eas.json`):**
- `preview` — APK interno, aponta para `https://revela.gersonvan.com.br`
- `development` — APK com dev client
- `production` — AAB para Play Store. O script ABORTA automaticamente se
  `EXPO_PUBLIC_MODERATOR_API_BASE_URL` não estiver definido no perfil, para evitar
  gerar um AAB apontando para localhost. Não contornar essa trava sem corrigir o
  `eas.json` antes.

**Quando disparar um build:**
- Quando o usuário pedir explicitamente ("builda", "gera um APK", "testa no celular")
- Ao concluir uma feature/fix no `apps/moderator` que precisa validação em dispositivo real
- Nunca disparar automaticamente a cada commit — cada build consome minutos de CPU
  do servidor; só faz sentido builda quando há algo específico para testar

**Pré-requisito sempre:** as mudanças precisam estar commitadas E enviadas
(`git push origin main`) antes do build — o servidor roda `git pull origin main`,
não builda o working tree local nem branches não enviadas.

**Comandos:**

```bash
git push origin main
ssh gersonvan@100.78.149.56 '~/build/build.sh preview'
scp gersonvan@100.78.149.56:~/build/output-preview.apk ./
```

Trocar `preview` por `development` ou `production` conforme necessário.

**Após aprovação final das alterações:**

Quando as alterações finais do `apps/moderator` forem aprovadas, instalar e testar o APK em um Android conectado antes de considerar a mudança pronta.

```bash
git status --short --branch
ssh eventoon-build '~/build/build.sh preview'
scp eventoon-build:~/build/output-preview.apk ./output-preview.apk
adb install -r ./output-preview.apk
adb shell monkey -p br.com.gersonvan.revelamoderador 1
adb exec-out screencap -p > /tmp/revela-moderator-screen.png
rm -f ./output-preview.apk
```

Se `adb install -r` falhar com `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, remover a versão instalada e reinstalar:

```bash
adb uninstall br.com.gersonvan.revelamoderador
adb install ./output-preview.apk
```

Validar visualmente a captura em `/tmp/revela-moderator-screen.png`: o app deve abrir no login ou na moderação, com backend de produção, sem ficar preso em `Verificando sessão`. O APK copiado para o repo é artefato temporário e deve ser removido após o teste.

**Em caso de falha:** o script roda com `set -euo pipefail`, então a mensagem de
erro aparece direto na saída do comando `ssh`. Não há passo silencioso de retry —
qualquer falha de `pnpm install`, `eas build` ou pull interrompe o script.

## Teste iOS local (iPhones confiáveis)

O app `apps/moderator` também pode ser testado em iPhones confiáveis sem conta
Apple Developer paga, usando Xcode local e assinatura com Apple ID gratuito.
Esse fluxo é apenas para validação local em aparelhos conectados ao Mac; não é
distribuição pública, TestFlight ou App Store.

**Pré-requisitos no Mac:**
- Xcode instalado e selecionado em `/Applications/Xcode.app/Contents/Developer`
- CocoaPods instalado
- iPhone conectado por cabo, desbloqueado e com confiança concedida ao Mac
- Apple ID configurado no Xcode para assinatura local gratuita
- Backend sempre apontando para `https://revela.gersonvan.com.br` em testes de produção

**Quando usar:**
- Quando o usuário pedir teste em iPhone ou validação iOS
- Quando houver alteração final no `apps/moderator` que precisa ser conferida em iPhone real
- Não usar como substituto de distribuição oficial; builds com Apple ID gratuito expiram e exigem instalação manual

**Comandos para simulador ou iPhone conectado:**

```bash
cd apps/moderator
EXPO_PUBLIC_MODERATOR_API_BASE_URL=https://revela.gersonvan.com.br npx expo run:ios --device
```

Quando houver mais de um destino, escolher explicitamente o aparelho listado pelo Expo/Xcode.
Para simulador já validado localmente, `iPhone 17` funcionou:

```bash
cd apps/moderator
EXPO_PUBLIC_MODERATOR_API_BASE_URL=https://revela.gersonvan.com.br npx expo run:ios --device "iPhone 17"
```

**Validação visual obrigatória:**
- O app deve abrir na tela de login/moderação
- O campo `URL do backend` deve estar preenchido com `https://revela.gersonvan.com.br`
- O app não deve ficar preso em `Verificando sessão`
- Se houver convite de teste, validar ativação, listagem de pendentes e aprovar/rejeitar uma foto de teste

**Artefatos gerados:**
- O Expo pode gerar `apps/moderator/ios/` e `apps/moderator/.expo/` durante `run:ios`
- Manter esses diretórios fora do Git enquanto o projeto seguir no fluxo Expo managed
- Se o Expo alterar scripts em `apps/moderator/package.json` para `expo run:*`, restaurar para `expo start:*` antes de finalizar, salvo decisão explícita de versionar o prebuild

**Workaround local conhecido:**

Se o build falhar em `ExpoModulesJSI` com erro parecido com:

```text
resource fork, Finder information, or similar detritus not allowed
```

o problema é atributo estendido do macOS no framework gerado pelo Xcode. O contorno
validado localmente foi fazer o `ExpoModulesJSI` usar DerivedData fora da pasta do
repo, por exemplo em `/tmp`, e reconstruir o xcframework. Esse ajuste fica em
`node_modules` e não deve ser commitado.

Depois de um teste iOS local, sempre conferir:

```bash
git status --short --branch
pnpm --filter @eventoon/moderator-app typecheck
```

} //APM_RULES
