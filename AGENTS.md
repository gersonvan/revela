APM_RULES {

## Production Safety

- Preserve the existing production web flow unless the assigned task explicitly changes it.
- Do not break guest upload by QR Code, admin login, moderator access, screen display, or ZIP/export flows while working on Fase 2.
- Keep native app and video proof work isolated from the production event flow unless the task explicitly asks for integration.
- Treat `https://revela.gersonvan.com.br` as the production target for user-facing validation.

## Validation

- Before marking implementation work complete, run the strongest relevant validation available for the touched area.
- For Next.js web changes, prefer `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- For documentation-only changes, verify the edited files render as coherent Markdown and have no obviously truncated sections.
- For production-impacting changes, include a concise smoke-check summary with exact commands or URLs checked.
- If a validation cannot be run, state why and identify the remaining risk.

## Continuous Delivery

- Keep changes small enough to review, commit, push, and deploy continuously when they affect user-facing behavior.
- Do not bundle unrelated refactors with event-readiness work.
- If deploying, confirm the production deploy completes and record the resulting URL or domain check.
- Use `main` as the base branch for APM work unless the user changes it.
- Use `codex/<short-description>` branches for APM Worker tasks.
- Use short imperative commit messages, matching the existing repository history.
- Version APM planning and coordination artifacts in `.apm/` for this project.

## Documentation Language

- Write user-facing and operational documentation in clear Brazilian Portuguese with accents.
- Keep operational runbooks suitable for a non-technical operator.
- Separate completed behavior, planned behavior, blocked work, and deferred ideas clearly.

## Cost Discipline

- Prefer existing infrastructure and free or low-cost services.
- Do not introduce a new paid dependency, paid managed service, or recurring cost without explicitly documenting the need and tradeoff.
- For storage, push, video processing, or app build/distribution choices, surface cost implications before treating an option as the preferred path.

## Native App Boundaries

- The native app work is focused first on moderators.
- Do not expand native app scope to guest upload unless explicitly assigned.
- Do not claim App Store or Google Play availability is guaranteed; account setup and review are external dependencies.
- Keep web moderation as the safe fallback for the 2026-07-11 event.

## Video Proof Boundaries

- Video work in this phase is a controlled proof, not a production guest upload feature.
- Do not wire video into the live event flow unless explicitly assigned.
- Keep any video processing experiment isolated, reproducible, and cost-aware.
- Document how originals are handled in any video proof: retained temporarily, discarded, or reserved for a future paid option.

## Data And Access Safety

- Preserve event scoping for admin, moderator, app, and API access.
- Do not expose pending or rejected photos through public screen or guest flows.
- Keep moderator actions auditable where the task changes photo state.
- Avoid logging secrets, tokens, private e-mails, or storage credentials.

## Working In The Repository

- Respect existing user or agent changes. Do not revert files you did not intentionally change.
- Use existing project patterns before adding new abstractions.
- Keep generated artifacts out of Git unless the repository already tracks that artifact type or the task explicitly requires it.
- Prefer focused edits in the files owned by the assigned task.

} //APM_RULES
