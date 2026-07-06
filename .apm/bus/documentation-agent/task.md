---
stage: 5
task: 2
agent: documentation-agent
log_path: ".apm/memory/stage-05/task-05-02.log.md"
has_dependencies: true
---

# Task 5.2 - Event Runbook Update 2026-07-11

## Task Reference

Task 5.2 assigned to `documentation-agent`.

## Context Dependencies

This Task depends on the final smoke checks and video proof documentation.

**Final smoke findings to incorporate:**

- The recommended critical path for the 2026-07-11 event is web-only:

```text
QR Code -> upload web -> moderação web -> telão -> exportação ZIP
```

- Local checks passed: `pnpm typecheck`, `pnpm build`, and `pnpm --filter @eventoon/moderator-app typecheck`.
- Public production checks passed for home, event upload page, screen, short screen redirect, approved-photo feed, admin login, and protected-route redirects.
- Database-backed smokes were blocked by unavailable Docker/Postgres in the current environment.
- Authenticated admin, real moderator-token flow, ZIP/export download, QR generation with session, and physical mobile checks still need a real pre-event rehearsal.
- App native is prototype status only and must not be required for event operation.
- Video remains a controlled proof and must stay outside the production guest upload/screen flow for this event.

**Files to read before editing:**

- `docs/OPERACAO_EVENTO.md` - current operator runbook. It has useful structure but also stale/rough sections; make it coherent.
- `docs/QA-2026-07-06-smoke-final-producao.md` - final smoke evidence and remaining caveats.
- `docs/APP_MODERADOR_BUILD_DISTRIBUICAO.md` - app status and distribution limits.
- `docs/PROVA_VIDEO_CONTROLADA.md` - video proof boundaries.
- `docs/QA-2026-07-05-validacao-fluxo-web.md` - web moderation mode validation context.

## Objective

Update `docs/OPERACAO_EVENTO.md` into a clear Brazilian Portuguese runbook for operating Revela on 2026-07-11.

## Detailed Instructions

1. Rewrite the runbook for a non-technical operator. Keep it practical, direct, and event-day focused.
2. Separate the document into clear operational sections:
   - antes do evento;
   - escolha do modo de moderação;
   - checklist de ensaio;
   - durante o evento;
   - problemas comuns;
   - depois do evento;
   - o que não usar como caminho crítico.
3. Include explicit guidance for the moderation mode decision:
   - `Com moderação`: safer default, photos wait for approval;
   - `Sem moderação`: photos can appear directly on the screen, requiring active monitoring and prior rehearsal.
4. Include web fallback guidance:
   - web moderation remains the safe path;
   - native app is optional/prototype and must not block the event.
5. Include QR/screen checks:
   - open QR on a real phone;
   - submit a test photo;
   - confirm pending/approved behavior;
   - confirm the screen opens in full-screen environment.
6. Include export guidance:
   - test ZIP/export with admin session before the event;
   - download export after the event;
   - do not log credentials or tokens in the document.
7. Include video scope:
   - video proof is not in the live event flow;
   - guests should use photo upload only for 2026-07-11 unless a separate future implementation changes that.
8. Remove or rewrite stale, truncated, duplicated, or overly technical fragments in `docs/OPERACAO_EVENTO.md`.
9. Do not change application code.

## Workspace

- Worktree: `/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-update-event-runbook`
- Branch: `codex/update-event-runbook`
- Resolve Task Log and bus paths against the project root `/Users/gersonvan/Documents/EventoOn/.apm/`, not the worktree copy.
- Commit documentation changes on your branch. Do not merge.

## Expected Output

- Updated `docs/OPERACAO_EVENTO.md` with before-event, during-event, after-event, moderation-mode, app fallback, QR/screen, ZIP/export, and common-incident guidance.

## Validation Criteria

- Documentation is coherent Markdown with no truncated sections.
- Language is clear Brazilian Portuguese with accents.
- Instructions are suitable for a non-technical operator.
- Completed behavior, blocked work, and deferred app/video items are clearly separated.
- The runbook does not promise App Store/Google Play availability.
- The runbook does not put native app or video on the critical path for 2026-07-11.

## Instruction Accuracy

The objective and expected output are authoritative. If a referenced document has stale or conflicting details, use the final smoke evidence and current production-safety rule as the source of truth.

## Task Iteration

If you find a major inconsistency outside `docs/OPERACAO_EVENTO.md`, do not broaden the edit without clear need. Document the finding in the Task Log and keep this task focused on the event runbook unless the inconsistency would mislead event operators.

## Task Logging

Write the Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-05/task-05-02.log.md`

Use the standard log structure with Summary, Details, Output, Validation, Issues, Compatibility Concerns, and Important Findings.

## Task Report

When complete, write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/documentation-agent/report.md`

Include status `Success`, `Partial`, or `Failed`, the log path, and any important findings or compatibility issues.
