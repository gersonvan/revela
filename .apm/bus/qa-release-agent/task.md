---
stage: 5
task: 1
agent: qa-release-agent
log_path: ".apm/memory/stage-05/task-05-01.log.md"
has_dependencies: true
---

# Task 5.1 - Final Smoke Production Checks

## Task Reference

Task 5.1 assigned to `qa-release-agent`.

## Context Dependencies

This Task depends on completed web readiness work and moderator app prototype/distribution planning.

**From the web readiness work:**

- The production-safe event flow remains: guest QR upload -> web upload -> web moderation -> screen display -> ZIP/export.
- Event moderation mode exists at event level:
  - with moderation: new uploads should remain pending until reviewed;
  - without moderation: new uploads should become approved automatically and record `AUTO_APPROVED` history.
- Guest selection is limited to 15 media items and should not discard a valid existing selection when a user tries to add too many files.
- Mobile web moderation is the operational fallback and must remain usable on phone-sized screens.
- Prior QA accepted lint/typecheck/build and public production checks, but Docker/Postgres unavailability blocked full local database E2E, and authenticated admin/moderator/export checks still require valid credentials/session/token.

**From the moderator app prototype work:**

- Backend app APIs exist under `/api/moderator-app/*`.
- `apps/moderator` contains the Expo moderator prototype.
- Validate app TypeScript separately with `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`; the root TypeScript config intentionally excludes `apps` to avoid React Native global type conflicts.
- `docs/APP_MODERADOR_BUILD_DISTRIBUICAO.md` records build/distribution status.
- Native app distribution is not event-critical and remains externally constrained by `eas.json`/EAS project setup, Apple/Google accounts, signing credentials, physical-device testing, and review timing.
- `eas-cli` was verified during the previous investigation but is not versioned because adding it caused the current `pnpm` supply-chain policy to reject a newly published transitive dependency.
- Web moderation remains the safe fallback for the 2026-07-11 event.

## Objective

Validate the production-ready subset of Fase 2 before the 2026-07-11 event and produce a concise final smoke report.

## Detailed Instructions

1. Work in the assigned worktree and keep changes focused on QA evidence/documentation only.
2. Run the strongest relevant local validation available:
   - `rtk pnpm install`
   - `rtk pnpm lint`
   - `rtk pnpm typecheck`
   - `rtk pnpm build`
   - `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`
3. If Docker/Postgres is available, attempt relevant smoke scripts:
   - moderation-mode smoke if available;
   - `pnpm smoke:moderator-app` with the required database URL and seeded data.
4. Check production public availability at `https://revela.gersonvan.com.br`.
5. Check public routes relevant to the event without exposing secrets. Do not log tokens, private emails, storage credentials, or session cookies.
6. For authenticated admin/moderator/export checks, run them only if a valid local session/token/environment is already available. If not available, record the exact blocker and remaining risk instead of guessing.
7. Verify or document the readiness of:
   - guest upload path;
   - moderation modes;
   - mobile web moderation fallback;
   - screen display path;
   - ZIP/export path;
   - moderator app prototype status;
   - video proof status as non-production for this event.
8. Keep the event-readiness recommendation practical: focus on what must work for 2026-07-11, not on perfect completion of strategic app/store/video items.

## Workspace

- Worktree: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-final-smoke-production-checks`
- Branch: `codex/final-smoke-production-checks`
- Resolve Task Log and bus paths against the project root `/Users/gersonvan/Documents/EventoOn/.apm/`, not the worktree copy.
- Commit any QA report/documentation updates on your branch. Do not merge.

## Expected Output

- Final smoke check report covering web guest upload, moderation modes, web moderation fallback, screen behavior, export behavior, moderator app prototype status, and video proof status.
- Any documentation updates needed to preserve the smoke evidence.

## Validation Criteria

- Report includes exact commands/checks, pass/fail results, production URL status, and explicit risks remaining for the event.
- Report clearly separates validated, blocked, partial, and deferred items.
- No secrets, tokens, private emails, storage credentials, or session cookies are logged.
- Local validation failures are investigated enough to identify whether they are code regressions, environment blockers, or known external constraints.

## Instruction Accuracy

The objective and expected output are authoritative. If an instruction is impossible because required credentials, Docker/Postgres, production access, or a physical device are unavailable, record the blocker precisely and continue with the next strongest validation.

## Task Iteration

If a command fails, inspect the error and make a reasonable attempt to distinguish implementation failure from environment/setup failure. If a fix would be broad or risky, do not implement it; report `Partial` with evidence and recommended next action.

## Task Logging

Write the Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-05/task-05-01.log.md`

Use the standard log structure with Summary, Details, Output, Validation, Issues, Compatibility Concerns, and Important Findings.

## Task Report

When complete, write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/qa-release-agent/report.md`

Include status `Success`, `Partial`, or `Failed`, the log path, and any important findings or compatibility issues.
