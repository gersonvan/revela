---
stage: 3
task: 2
agent: web-product-agent
log_path: ".apm/memory/stage-03/task-03-02.log.md"
has_dependencies: true
---

# Moderator App Backend

## Task Reference

Task 3.2 assigned to `web-product-agent`.

## Context Dependencies

This Task depends on the native app architecture document completed by the Native App Agent.

**Integration Steps:**

1. Read `docs/ARQUITETURA_APP_MODERADOR.md` completely. Treat it as the proposed API/session contract for this Task.
2. Inspect current moderation implementation:
   - `src/lib/moderation`
   - `src/app/moderate/[token]/page.tsx`
   - `src/app/moderate/[token]/actions.ts`
   - `src/components/moderation/bulk-moderation-actions.tsx`
   - `src/app/admin/events/actions.ts`
   - `prisma/schema.prisma`
3. Preserve the existing web moderator token/cookie flow. Do not break `/moderate/[token]`.

**Producer Output Summary:**

The architecture document proposes an Expo/React Native moderator app with:

- invitation/session activation from existing moderator invite token;
- app-specific session token stored by the app;
- event-scoped APIs derived from authenticated moderator session;
- pending photo list/detail;
- approve/reject actions reusing current moderation decision rules;
- push token registration with grouped/throttled alerts later;
- web moderation fallback for the 2026-07-11 event.

Current backend does not yet have app-specific moderator sessions, device registration, or push-token persistence. The implementation should add minimal prototype-compatible backend support while staying free/low-cost and preserving production web flow.

## Objective

Provide backend support needed by the moderator app prototype.

## Detailed Instructions

1. Add schema/model support for app moderator sessions/devices if needed. Keep it migration-safe and event-scoped through the existing `Moderator` relation.
2. Implement app-safe session activation:
   - accept an invite token;
   - validate against existing moderator token hash/status rules;
   - create an app session/device record;
   - return a session token and event/moderator context;
   - store only hashes for session tokens.
3. Implement authenticated app endpoints under a clear namespace such as `/api/moderator-app/...`:
   - validate current session/context;
   - list pending photos for the moderator's event;
   - optionally fetch a single photo detail;
   - approve/reject a photo using current moderation history semantics;
   - register/update a push token or prototype-compatible placeholder.
4. Ensure every app endpoint derives event access from the authenticated moderator/session. Never trust client-provided `eventId` alone.
5. Ensure revoked moderators or revoked/expired sessions cannot access app endpoints.
6. Reuse existing moderation action logic where practical. Avoid duplicating status/history rules inconsistently.
7. Keep push dispatch hooks minimal and no-cost. It is acceptable to persist tokens or define integration points without sending real push notifications yet.
8. Add focused validation coverage where practical. At minimum run lint/typecheck/build and any schema generation/format needed.
9. Document endpoint behavior and any caveats in a concise docs update if helpful for the Expo app implementation.

## Workspace

Use this worktree for edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-moderator-app-backend`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/moderator-app-backend`

Do not merge.

## Expected Output

API routes/server helpers for moderator invitation validation, app session/device registration, event-scoped pending-photo retrieval, approve/reject operations, and push dispatch/token hooks if feasible.

## Validation Criteria

- Backend endpoints are authenticated and scoped to the invited moderator/event.
- Endpoints do not expose photos from other events.
- Pending-photo retrieval works by session-derived event.
- Approve/reject operations reuse or match existing moderation status/history rules.
- Existing web moderator token flow remains intact.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass, or blockers are documented precisely.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, preserve existing production flow safety, document the discrepancy in the Task Log, and proceed with the safest implementation.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-03/task-03-02.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/web-product-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports web-product-agent`.
