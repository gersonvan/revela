---
stage: 2
task: 4
agent: qa-release-agent
log_path: ".apm/memory/stage-02/task-02-04.log.md"
has_dependencies: true
---

# Web Flow Validation

## Task Reference

Task 2.4 assigned to `qa-release-agent`.

## Context Dependencies

This Task depends on completed Stage 2 web implementation.

**Integration Steps:**

1. Inspect the Stage 2 implementation now merged into your assigned branch:
   - `prisma/schema.prisma`
   - migrations under `prisma/migrations/`
   - `src/app/admin/events/[eventId]/page.tsx`
   - `src/app/admin/events/actions.ts`
   - upload API route under `src/app/api/events/[slug]/photos/route.ts`
   - `src/components/upload/photo-upload-form.tsx`
   - `src/app/moderate/[token]/page.tsx`
   - `src/components/moderation/bulk-moderation-actions.tsx`
   - `scripts/smoke-moderation-mode.mjs`
2. Review available docs that now describe current behavior:
   - `docs/STATUS_IMPLEMENTACAO.md`
   - `docs/QA-2026-07-05-baseline-operacional.md`
   - `docs/OPERACAO_EVENTO.md`

**Producer Output Summary:**

Task 2.1 added event-level moderation mode:

- `WITH_MODERATION`: current default behavior; uploads enter `PENDING`.
- `WITHOUT_MODERATION`: event configured as `Sem moderação`; uploads should auto-approve.
- Admin UI shows `Com moderação` and `Sem moderação` controls with a strong warning for `Sem moderação`.

Task 2.2 applied moderation mode to uploads:

- Upload API reads `Event.moderationMode`.
- `WITH_MODERATION` creates pending photos.
- `WITHOUT_MODERATION` creates approved photos.
- Automatic approvals create moderation history using `AUTO_APPROVED`, with nullable `moderatorId`.
- Auto-approved photos should appear in the approved-photo feed and remain rejectable/removable through the existing moderation flow.
- Guest photo selector now preserves valid existing selection and shows a Portuguese limit message if adding more than 15 items.
- Worker validation passed `pnpm lint`, `pnpm typecheck`, `pnpm build`, Prisma format/generate, and `node --check scripts/smoke-moderation-mode.mjs`; full smoke script execution was blocked by local Docker daemon unavailability.

Task 2.3 improved mobile moderation fallback:

- larger mobile touch targets;
- clearer pending count;
- safer destructive-action labels;
- individual and bulk approve/reject actions preserved;
- new-photo refresh behavior preserved.

Known caveats:

- Authenticated admin/moderator/export validation requires a valid session/token or configured local environment.
- Docker may be unavailable locally; if it blocks database smoke checks, record exact error and run strongest fallback.

## Objective

Validate event-ready web changes before app work depends on them.

## Detailed Instructions

1. Run project validation commands from the assigned worktree. Prefer:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build`
   - Prisma validation/generation if needed
2. Validate or attempt to validate upload behavior:
   - `Com moderação` / `WITH_MODERATION`: upload creates pending photos.
   - `Sem moderação` / `WITHOUT_MODERATION`: upload creates approved photos and appears in approved feed.
3. Validate or inspect automatic history:
   - auto-approved uploads record `AUTO_APPROVED`;
   - no human moderator is falsely attached to automatic approval;
   - later rejection/removal remains possible through existing moderation logic.
4. Validate the 15-item selection UX:
   - selecting too many media items does not discard existing valid selection;
   - message is clear in Portuguese.
5. Validate mobile moderation fallback at mobile dimensions if browser tooling/environment allows. If not, inspect layout/code and report the limitation.
6. Check production deploy readiness. Do not deploy unless explicitly available and safe in the current workflow. If no deploy is performed, state that clearly.
7. Write concise validation evidence and risks under `docs/`, updating status docs if appropriate.

## Workspace

Use this worktree for validation and documentation edits:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-validate-web-flow`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/validate-web-flow`

Do not merge.

## Expected Output

Validation evidence covering `Com moderação`, `Sem moderação`, upload selection limit UX, moderation web fallback, screen/approved feed behavior, and production deploy readiness.

## Validation Criteria

- Report shows pass/fail for upload -> moderation/screen behavior in both modes.
- Report confirms selecting more than 15 media items does not force the guest to restart a valid selection.
- Report includes mobile moderation sanity check or a clear environment limitation.
- Report summarizes exact commands, route checks, and remaining risks.
- If production deploy occurs, report deployment result and URL check. If no deploy occurs, state no deploy was performed.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, document the discrepancy in the Task Log, and proceed with the strongest safe validation.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-02/task-02-04.log.md`

## Reporting Instructions

When complete, commit any documentation/evidence changes and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/qa-release-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports qa-release-agent`.
