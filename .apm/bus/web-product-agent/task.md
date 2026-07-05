---
batch: true
batch_size: 2
tasks:
  - stage: 2
    task: 1
    log_path: ".apm/memory/stage-02/task-02-01.log.md"
  - stage: 2
    task: 3
    log_path: ".apm/memory/stage-02/task-02-03.log.md"
---

# APM Batch Task: Event-Ready Web Controls

You have two independent Tasks in one branch. Complete both, commit once or in focused commits on the assigned branch, and write one Task Log per Task plus a batch Task Report.

---

---
stage: 2
task: 1
agent: web-product-agent
log_path: ".apm/memory/stage-02/task-02-01.log.md"
has_dependencies: true
---

# Moderation Mode Model And Admin UI

## Task Reference

Task 2.1 assigned to `web-product-agent`.

## Context Dependencies

This Task depends on completed documentation and baseline work.

**Integration Steps:**

1. Read the current product docs only as implementation context, especially `docs/PRD.md`, `docs/BACKLOG.md`, `docs/ROADMAP.md`, and `docs/STATUS_IMPLEMENTACAO.md`.
2. Inspect existing admin event settings and event model patterns before adding new abstractions:
   - `prisma/schema.prisma`
   - `src/app/admin/events/[eventId]/page.tsx`
   - admin event actions/routes under `src/app/admin`
   - event validation/access helpers under `src/lib`
3. Preserve current default behavior for existing events: uploads require moderation unless an event is explicitly configured otherwise.

**Producer Output Summary:**

Documentation was repaired to describe Fase 2 clearly. Current Fase 2 web requirement is event-level moderation mode with two modes:

- `Com moderação`: uploaded photos enter pending review and require approval before appearing on the screen.
- `Sem moderação`: uploaded photos are automatically approved and can appear on the screen without prior review.

When `Sem moderação` is selected, the admin UI must show a strong warning because photos can appear directly on the screen. Even in this mode, admins/moderators must still be able to remove or reject photos after they appear. Automatic approvals should preserve useful history when upload behavior is implemented by the next Task.

QA baseline passed `pnpm lint`, `pnpm typecheck`, and `pnpm build`. Public production routes were healthy. Authenticated admin/moderator/export checks still require a configured session or local environment, so note any validation caveat precisely.

## Objective

Add event-level moderation mode configuration and expose it clearly in the admin event settings UI.

## Detailed Instructions

1. Add a durable event-level moderation mode representation to the data model. Prefer a clear enum or constrained field that maps directly to the two modes above.
2. Ensure existing events default to the current `Com moderação` behavior.
3. Create any required Prisma migration or generated update following the repo's current Prisma 7 patterns.
4. Add admin UI/server handling so an admin can configure the mode for an event.
5. Use clear Brazilian Portuguese labels:
   - `Com moderação`
   - `Sem moderação`
6. When `Sem moderação` is visible or selected, show warning copy that makes the consequence explicit: photos may appear directly on the telão without prior review.
7. Preserve existing admin login/access, event scoping, QR links, screen links, export links, moderator management, and status actions.
8. Do not implement upload auto-approval in this Task; add the configuration surface and persistence needed for the next Task.

## Workspace

Use this worktree for code edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-event-ready-web-controls`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/event-ready-web-controls`

Do not merge.

## Expected Output

Schema/model changes, admin settings UI, and server-side settings handling for event moderation mode.

## Validation Criteria

- Admin can configure `Com moderação` and `Sem moderação` for an event.
- Existing events retain current moderated behavior by default.
- `Sem moderação` displays a strong warning in admin context.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass, or any blocker is documented precisely.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-02/task-02-01.log.md`

---

---
stage: 2
task: 3
agent: web-product-agent
log_path: ".apm/memory/stage-02/task-02-03.log.md"
has_dependencies: true
---

# Mobile Web Moderation Fallback

## Task Reference

Task 2.3 assigned to `web-product-agent`.

## Context Dependencies

This Task depends on the operational baseline.

**Integration Steps:**

1. Inspect the current moderator route and components:
   - `src/app/moderate/[token]/page.tsx`
   - moderation actions/routes used by approve/reject/bulk actions
   - refresh or polling components such as `moderation-auto-refresh`
2. Use the repaired docs and current design handoff as context for visual direction:
   - `docs/DESIGN_HANDOFF.md`
   - existing Revela tokens/classes already in the app
3. Keep the existing moderator token/cookie access model intact.

**Producer Output Summary:**

QA baseline confirmed the production web app is publicly available and local lint/typecheck/build passed before Stage 2. Authenticated moderator checks still require valid private token/session. The web moderator experience remains the safe fallback for the 2026-07-11 event if native app distribution is blocked.

## Objective

Improve the existing web moderation page so it is a reliable mobile fallback during event operation.

## Detailed Instructions

1. Review the current `/moderate/[token]` layout at common mobile widths.
2. Improve mobile usability: larger touch targets, clearer pending counts, better spacing, stronger photo preview hierarchy, and action placement that is practical on phones.
3. Keep individual approve/reject actions available.
4. Keep bulk approve/reject actions available if they currently exist.
5. Make destructive actions visually distinct and harder to trigger accidentally.
6. Preserve pending/approved/rejected tabs and the existing refresh/new-photo behavior.
7. Do not change moderator authorization semantics or event scoping.
8. Do not make native app assumptions here; this page is the web fallback.

## Workspace

Use this worktree for code edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-event-ready-web-controls`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/event-ready-web-controls`

Do not merge.

## Expected Output

Updated moderation UI optimized for phone use, clearer pending counts, larger actions, safer review flow, and no regression to approve/reject/bulk actions.

## Validation Criteria

- Moderation page is usable at mobile widths without horizontal overflow.
- Individual approve/reject actions remain available.
- Bulk approve/reject actions remain available if already supported.
- New-photo refresh behavior still works.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass, or any blocker is documented precisely.
- Manual browser/mobile checks are noted if performed; if not possible, state why.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-02/task-02-03.log.md`

---

## Batch Reporting Instructions

After both Tasks are complete:

1. Commit the branch `codex/event-ready-web-controls`.
2. Write a batch report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/web-product-agent/report.md`

Use frontmatter:

```yaml
---
batch: true
agent: web-product-agent
completed:
  - stage: 2
    task: 1
    status: Success
    log_path: ".apm/memory/stage-02/task-02-01.log.md"
  - stage: 2
    task: 3
    status: Success
    log_path: ".apm/memory/stage-02/task-02-03.log.md"
stopped_early: false
---
```

Adjust statuses if any Task is Partial or Failed. Then tell the user to return to the Manager with `/apm-5-check-reports web-product-agent`.
