---
title: Revela Fase 2
---

# APM Memory Index

## Memory Notes

- Keep authenticated admin, moderator token, export, physical mobile QR checks explicit event-readiness work; prior baseline only verified public production routes plus local lint/typecheck/build without configured credentials.
- Stage 2 web controls are merged, but event readiness still needs authenticated admin/moderator/export rehearsal and real mobile QR/moderation checks before relying on the flow operationally.
- Expo moderator app prototype lives in `apps/moderator`; root TypeScript excludes `apps` to avoid React Native global type conflicts, so app validation must use `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`.
- Moderator app backend is implemented behind `/api/moderator-app/*` with app sessions and event-scoped endpoints, but local end-to-end smoke still requires Docker/Postgres.
- Push registration in the Expo app is prototype-only: backend stores tokens, but grouped backend dispatch is not implemented yet, and real token validation needs a supported physical device plus Expo/EAS setup.
- `eas-cli` was verified during Task 3.5 but is not versioned for `@eventoon/moderator-app`; adding it caused a `pnpm` `minimumReleaseAge` supply-chain block through a new transitive dependency. The app still needs `eas.json`, an EAS project, store credentials, and physical-device validation before native distribution.
- Video remains a controlled proof only in this phase. The 2026-07-11 event flow must stay focused on photos, moderation, stable screen display, and export.

## Stage Summaries

### Stage 1 - Baseline Documentation Repair

Stage 1 repaired the product documentation baseline and established operational QA context before Fase 2 implementation. Documentation work cleaned stale or corrupted product docs and reflected the current scope around moderation modes, moderator app direction, push strategy, video proof boundaries, and event-operation guidance. QA documented the baseline: local `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed, public production routes returned expected statuses, and protected admin/export/QR routes required session or credentials for deeper checks.

**Task Logs:**

- task-01-01.log.md
- task-01-02.log.md

### Stage 2 - Event-Ready Web Controls

Stage 2 delivered the web controls needed before app work could depend on backend behavior: event-level moderation mode in admin settings, upload behavior for `WITH_MODERATION` and `WITHOUT_MODERATION`, `AUTO_APPROVED` moderation history, safer guest selection handling for the 15-photo limit, and mobile-oriented improvements to the web moderation fallback. QA accepted the stage with operational caveats: `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed, public production checks were healthy, and code/smoke-script inspection supported moderation-mode behavior, but local Docker/Postgres was unavailable for full `pnpm smoke:moderation-mode`; private admin, moderator, export, and real mobile checks still require credentials/session.

**Task Logs:**

- task-02-01.log.md
- task-02-02.log.md
- task-02-03.log.md
- task-02-04.log.md

### Stage 3 - Moderator App Prototype

Stage 3 completed the moderator app prototype stream. Native App Agent documented the architecture and API contract, created the Expo app core under `apps/moderator`, and added app-side Expo notification registration. Web Product Agent implemented the backend support behind `/api/moderator-app/*`, including `ModeratorSession`, app session activation, event-scoped pending-photo APIs, approve/reject decisions, push-token persistence, `docs/API_APP_MODERADOR.md`, and the `pnpm smoke:moderator-app` script. QA Release Agent prepared the build/distribution runbook in `docs/APP_MODERADOR_BUILD_DISTRIBUICAO.md` and verified `eas-cli`, but Manager review removed the versioned `eas-cli` dependency because the resulting lockfile failed the current `pnpm` supply-chain policy. Store delivery remains blocked by `eas.json`/EAS project setup, Expo SDK dependency alignment, Apple/Google accounts, physical-device testing, and review timing. The accepted operational decision is that the native app is prototype-ready, while web moderation remains the safe fallback for the 2026-07-11 event.

**Task Logs:**

- task-03-01.log.md
- task-03-02.log.md
- task-03-03.log.md
- task-03-04.log.md
- task-03-05.log.md

### Stage 4 - Video Proof

Stage 4 completed the isolated video proof stream without changing production upload, moderation, screen, export, schema, or storage behavior. Media Research Agent produced a low-cost architecture study and a local FFmpeg-based spike that generates a 5-10 second MP4 clip, poster, and manifest under ignored local storage. Documentation Agent consolidated the proof into product-facing documentation, linked the study/spike from the README/status/roadmap material, and made explicit that video is out of scope for the 2026-07-11 production event.

**Task Logs:**

- task-04-01.log.md
- task-04-02.log.md
- task-04-03.log.md
