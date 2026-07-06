---
stage: 3
task: 1
agent: native-app-agent
log_path: ".apm/memory/stage-03/task-03-01.log.md"
has_dependencies: true
---

# App Architecture And API Contract

## Task Reference

Task 3.1 assigned to `native-app-agent`.

## Context Dependencies

This Task depends on completed event-ready web controls and validation.

**Integration Steps:**

1. Inspect current moderation access and event scoping:
   - `src/lib/moderation`
   - `src/app/moderate/[token]/page.tsx`
   - moderation actions/routes used by approve/reject/bulk actions
   - `prisma/schema.prisma`
   - admin moderator creation/invite code under `src/app/admin/events`
2. Inspect current Stage 2 behavior:
   - event moderation mode in `prisma/schema.prisma`
   - upload API under `src/app/api/events/[slug]/photos/route.ts`
   - `docs/QA-2026-07-05-validacao-fluxo-web.md`
3. Produce documentation/design only. Do not implement backend routes or Expo app code in this Task.

**Producer Output Summary:**

Stage 2 delivered event-level web controls:

- Admin can configure `Com moderação` / `Sem moderação`.
- `WITH_MODERATION` uploads create `PENDING` photos.
- `WITHOUT_MODERATION` uploads create `APPROVED` photos and `AUTO_APPROVED` history.
- Web moderation remains the safe fallback and supports rejecting/removing approved photos.
- QA accepted the stage with caveats: lint/typecheck/build and public production checks passed, but Docker/Postgres and private session/token access are still needed for full authenticated E2E rehearsal.

App direction for this phase:

- Native app is for moderators first, not guests.
- Target stack is Expo/React Native.
- Access should be based on e-mail invitation and event-scoped authorization.
- App should support device/session registration, pending-photo list/detail, approve/reject actions, and grouped/throttled push notifications for new pending photos.
- App Store / Google Play publication is desirable but not guaranteed before the event because account setup and review are external dependencies.
- Web moderation remains the safe fallback for the 2026-07-11 event.

## Objective

Design the Expo moderator app architecture and API contract before implementation.

## Detailed Instructions

1. Review the current moderator token/link implementation and identify what can be reused for app access.
2. Define the app access/login flow based on e-mail invitation:
   - invitation creation;
   - invite acceptance/opening;
   - session/device binding;
   - event scoping;
   - revocation/expiration behavior.
3. Define proposed backend API endpoints and response shapes for:
   - validating an invitation or session;
   - registering a device/session;
   - listing pending photos;
   - fetching photo detail if needed;
   - approving/rejecting a photo;
   - registering/updating push token;
   - reporting app version/device metadata if useful.
4. Define app screens and state flow:
   - invitation/login screen;
   - event/moderator context;
   - pending list;
   - photo detail or review card;
   - approve/reject result states;
   - empty/error/offline states.
5. Define push notification behavior:
   - grouped or throttled new-photo alerts;
   - no sensitive photo data in lock-screen notifications;
   - fallback when push fails.
6. Document security and data-safety constraints:
   - preserve event scoping;
   - never expose pending/rejected photos publicly;
   - respect moderator revocation;
   - avoid logging tokens/secrets.
7. Document distribution/testing constraints:
   - what can be tested locally or with Expo dev build;
   - what requires Apple Developer / Google Play Developer accounts;
   - web moderation fallback for event day.

## Workspace

Use this worktree for documentation edits:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-moderator-app-architecture`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/moderator-app-architecture`

Do not merge.

## Expected Output

A technical design document covering Expo app structure, login by e-mail invitation, session/device registration, moderation endpoints, push behavior, distribution constraints, and free/low-cost infrastructure assumptions.

## Validation Criteria

- Document covers data flow, screens, API contract, device registration, notification grouping, and distribution constraints.
- Document keeps guest native app out of scope.
- Document keeps web moderation as fallback.
- Documentation is clear Brazilian Portuguese with accents.
- Markdown is coherent and has no obviously truncated sections.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, document the discrepancy in the Task Log, and proceed with the safest design.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-03/task-03-01.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/native-app-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports native-app-agent`.
