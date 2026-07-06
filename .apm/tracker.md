---
title: Revela Fase 2
completed_at: 2026-07-06T18:21:11Z
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:** Complete

**Stage 3:** Complete

**Stage 4:** Complete

**Stage 5:** Complete

## Worker Tracking

| Agent | Instance | Notes |
|-------|----------|-------|
| documentation-agent | 1 | Available after Task 5.2. |
| qa-release-agent | 1 | Available after Task 5.3. Authenticated/mobile E2E validation remains an event-readiness caveat. |
| web-product-agent | 1 | Available after Task 3.2. |
| native-app-agent | 1 | Available after Task 3.4. |
| media-research-agent | 1 | Tasks 4.1 and 4.2 completed. |

## Version Control

| Repository | Base Branch | Branch Convention | Commit Convention |
|------------|-------------|-------------------|-------------------|
| EventoOn | main | `codex/<short-description>` | Short imperative messages matching existing history. |

## Working Notes

- Stage 2 web flow has passed lint, typecheck, build, and code/smoke-script inspection, but Docker/Postgres unavailability blocked full local E2E smoke in prior QA.
- Production readiness still needs authenticated admin, moderator-token, export, QR/mobile, and screen checks against usable credentials/session.
- Stage 3 app work is prototype-complete for this phase. Store distribution remains externally constrained by Apple/Google accounts, EAS project/configuration, physical-device testing, and review timing.
- `eas-cli` was verified during Task 3.5 but is not versioned in `apps/moderator`; adding it introduced a `pnpm` `minimumReleaseAge` supply-chain block through a new transitive dependency.
- Web moderation remains the operational fallback for the 2026-07-11 event.
- Fase 2 APM execution is complete at 17/17 tasks. Remaining work is operational rehearsal, not open APM implementation: admin session, moderator token, QR on real phone, telão full-screen, ZIP export, and venue network/device checks.
