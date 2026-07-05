---
stage: 2
task: 2
agent: web-product-agent
log_path: ".apm/memory/stage-02/task-02-02.log.md"
has_dependencies: true
---

# Upload And History Behavior

## Task Reference

Task 2.2 assigned to `web-product-agent`.

## Context Dependencies

Building on your previous work:

**From Task 2.1:**

- Event-level moderation mode now exists as `EventModerationMode`.
- `WITH_MODERATION` means current behavior: uploaded photos enter pending review.
- `WITHOUT_MODERATION` means photos should be automatically approved on upload.
- Existing events default to `WITH_MODERATION`.
- Admin settings can persist the moderation mode and show a warning for `Sem moderação`.

**From Task 2.3:**

- Web moderation remains the safe fallback.
- Approved photos can still be moved/rejected from the web moderation UI.
- Bulk and individual actions remain available.

**Current additional requirement:**

Guest media selection must prevent avoidable loss of work. The event flow limits a batch to 15 items. If a guest selects more than 15 items, the UI must block or clearly warn without discarding an already valid selection and without forcing the guest to start over.

## Objective

Apply moderation mode to guest uploads, preserve useful moderation history, and improve guest media selection behavior for the 15-item batch limit.

## Detailed Instructions

1. Work in the assigned worktree and inspect:
   - `src/app/api/events/[slug]/photos/route.ts` or current upload API route.
   - upload form/client component under `src/components/upload`.
   - `prisma/schema.prisma` and existing moderation history model.
   - approved-photo feed used by the screen.
   - moderation action helpers/routes so auto-approved photos can still be rejected/removed later.
2. Update upload creation logic:
   - In `WITH_MODERATION`, uploaded photos remain `PENDING`.
   - In `WITHOUT_MODERATION`, uploaded photos are created as `APPROVED`.
3. Preserve event status validation and event scoping. Do not allow uploads to draft/closed events.
4. Add explicit history/audit for automatic approval if the existing model supports it. If a schema enum change is needed, keep it migration-safe and clear. If the current history model cannot represent automatic approval cleanly without undesirable schema churn, document the tradeoff and implement the safest explicit approach.
5. Ensure approved-photo APIs naturally include auto-approved photos.
6. Ensure moderators/admins can still reject/remove an auto-approved photo.
7. Update client-side selection handling so selecting more than 15 media items does not clear an existing valid selection. Show a clear Portuguese limit message.
8. Add focused tests or smoke coverage where the project structure supports it.

## Workspace

Use this worktree for edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-upload-history-behavior`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/upload-history-behavior`

Do not merge.

## Expected Output

Upload API behavior creates pending photos in `Com moderação` and auto-approved photos in `Sem moderação`, with appropriate history/audit handling and safer guest selection flow for the 15-item batch limit.

## Validation Criteria

- In `Com moderação`, uploaded photos remain pending.
- In `Sem moderação`, uploaded photos become approved and appear in the approved feed.
- Rejection/removal of auto-approved photos remains possible.
- Selecting more than 15 media items does not discard the guest's existing valid selection and shows a clear limit message.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass, or blockers are documented precisely.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, preserve production flow safety, document the discrepancy in the Task Log, and proceed with the safest implementation.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-02/task-02-02.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/web-product-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports web-product-agent`.
