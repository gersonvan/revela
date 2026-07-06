---
stage: 3
task: 5
agent: qa-release-agent
log_path: ".apm/memory/stage-03/task-03-05.log.md"
has_dependencies: true
---

# App Build And Distribution Plan

## Task Reference

Task 3.5 assigned to `qa-release-agent`.

## Context Dependencies

This Task depends on the completed moderator app prototype and push prototype.

**Integration Steps:**

1. Inspect:
   - `apps/moderator`
   - `apps/moderator/README.md`
   - `docs/ARQUITETURA_APP_MODERADOR.md`
   - `docs/API_APP_MODERADOR.md`
   - relevant app/backend package scripts.
2. Validate the app using the package-specific command. Do not rely only on root typecheck:
   - `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`
3. Keep App Store / Google Play publication as externally constrained. Do not promise availability.

**Producer Output Summary:**

Tasks 3.1-3.4 delivered:

- architecture/API contract for moderator app;
- backend `/api/moderator-app/*`, app sessions, event-scoped APIs, push-token persistence;
- Expo app prototype in `apps/moderator`;
- app-side push registration using Expo APIs;
- no backend push dispatch yet;
- web moderation remains fallback.

Known caveats:

- Root TypeScript excludes `apps` to avoid React Native global type conflicts. Validate app separately with package filter.
- Integrated backend/app smoke needs backend Next.js, database, test data, and moderator invite/session.
- Real push token generation needs physical device, OS permissions, and Expo project/credentials.
- App Store/Google Play account setup and review are external dependencies.

## Objective

Prepare realistic testing, build, and distribution documentation for the app prototype and store/account blockers.

## Detailed Instructions

1. Validate current app/package state with the strongest practical commands:
   - app typecheck by filter;
   - root typecheck if relevant;
   - any lightweight static/package checks available.
2. Document how to run the app prototype locally with Expo.
3. Document backend requirements for testing:
   - base URL;
   - Next.js server;
   - database;
   - moderator invite token;
   - physical device caveats.
4. Document realistic distribution options:
   - Expo Go limitations;
   - development build;
   - EAS internal/ad hoc/testing;
   - Apple Developer account requirements;
   - Google Play Developer account requirements.
5. Identify what can be tested before store accounts exist.
6. Identify what requires Apple/Google accounts or external review.
7. Provide safest plan for the 2026-07-11 event, explicitly keeping web moderation as fallback.
8. Update docs with a concise build/distribution checklist.

## Workspace

Use this worktree for validation and documentation edits:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-app-build-distribution-plan`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/app-build-distribution-plan`

Do not merge.

## Expected Output

Build/distribution checklist, test-build instructions, and account-readiness notes for Apple Developer and Google Play Developer.

## Validation Criteria

- Report identifies what can be tested before store accounts exist.
- Report identifies what requires Apple/Google accounts.
- Report includes safest plan for 2026-07-11 event.
- App validation command results are recorded.
- No claim that App Store or Google Play publication is guaranteed.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, document the discrepancy in the Task Log, and proceed with the safest release plan.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-03/task-03-05.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/qa-release-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports qa-release-agent`.
