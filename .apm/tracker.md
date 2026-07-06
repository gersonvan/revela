---
title: Revela Fase 2
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:** Complete

**Stage 3:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 3.1 | Done | native-app-agent | |
| 3.2 | Done | web-product-agent | |
| 3.3 | Done | native-app-agent | |
| 3.4 | Active | native-app-agent | codex/push-notification-prototype |
| 3.5 | Waiting: 3.4 | qa-release-agent | |

**Stage 4:** Complete

**Stage 5:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 5.1 | Waiting: 2.4, 3.5 | qa-release-agent | |
| 5.2 | Waiting: 5.1, 4.3 | documentation-agent | |
| 5.3 | Waiting: 5.1, 5.2 | qa-release-agent | |

## Worker Tracking

| Agent | Instance | Notes |
|-------|----------|-------|
| documentation-agent | 1 | Available after Task 4.3. |
| qa-release-agent | 1 | Available after Task 2.4; authenticated/mobile E2E validation remains a future event-readiness caveat. |
| web-product-agent | 1 | Available after Task 3.2. |
| native-app-agent | 1 | Task 3.4 dispatched. |
| media-research-agent | 1 | Tasks 4.1 and 4.2 completed. |

## Version Control

| Repository | Base Branch | Branch Convention | Commit Convention |
|-----------|-------------|-------------------|-------------------|
| EventoOn | main | `codex/<short-description>` | Short imperative messages matching existing history. |

## Working Notes

- APM artifacts are intentionally versioned in this project, per user preference.
- QA baseline accepted with documented auth/session caveat: local lint/typecheck/build and public production checks passed, while authenticated admin/moderator/export checks require a valid session or configured local environment.
- Task 2.2 should include the updated guest media selection requirement: selecting more than 15 items must not discard an existing valid selection and must show a clear limit message.
- Stage 2 validation should account for Docker/local database availability: Task 2.2 added `pnpm smoke:moderation-mode`, but end-to-end execution was blocked in the Worker by Docker daemon unavailability.
- Stage 2 accepted with caveats: lint/typecheck/build and public production checks passed, but `pnpm smoke:moderation-mode`, authenticated admin/moderator/export checks, and real mobile moderation validation still need an environment with Docker/Postgres plus private session/token access.
- Task 3.1 architecture proposes explicit native app session/device handling in `docs/ARQUITETURA_APP_MODERADOR.md`; backend implementation should treat that as contract proposal, not existing behavior.
- Task 3.2 added moderator app backend routes, `ModeratorSession`, session auth, app decision helper, push-token persistence, smoke script, and `docs/API_APP_MODERADOR.md`. End-to-end smoke remains blocked without Docker/Postgres.
- Task 3.3 added `apps/moderator`; React Native global types are intentionally isolated from root typecheck by excluding `apps` in root `tsconfig.json`. Validate the app with `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`.
