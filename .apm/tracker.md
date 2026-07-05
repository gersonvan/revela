---
title: Revela Fase 2
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 2.1 | Done | web-product-agent | |
| 2.2 | Done | web-product-agent | |
| 2.3 | Done | web-product-agent | |
| 2.4 | Active | qa-release-agent | codex/validate-web-flow |

**Stage 3:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 3.1 | Waiting: 2.4 | native-app-agent | |
| 3.2 | Waiting: 3.1 | web-product-agent | |
| 3.3 | Waiting: 3.1, 3.2 | native-app-agent | |
| 3.4 | Waiting: 3.2, 3.3 | native-app-agent | |
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
| qa-release-agent | 1 | Task 2.4 dispatched; authenticated validation remains a future event-readiness caveat. |
| web-product-agent | 1 | Tasks 2.1, 2.2, and 2.3 completed. |
| native-app-agent | 0 | Uninitialized. |
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
