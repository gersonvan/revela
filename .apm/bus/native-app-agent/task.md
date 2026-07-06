---
stage: 3
task: 4
agent: native-app-agent
log_path: ".apm/memory/stage-03/task-03-04.log.md"
has_dependencies: true
---

# Push Notification Prototype

## Task Reference

Task 3.4 assigned to `native-app-agent`.

## Context Dependencies

Building on your previous work:

**From Task 3.3:**

- Expo app prototype exists in `apps/moderator`.
- App supports invitation activation, session persistence, `/me`, pending-photo list, photo review, approve/reject, logout, loading/error/empty states.
- App uses `EXPO_PUBLIC_MODERATOR_API_BASE_URL` and a manually editable backend URL.
- Session persistence uses `expo-secure-store` on iOS/Android and fallback in memory for web.
- App validation should use `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`; root `pnpm typecheck` intentionally excludes `apps` due React Native global type conflicts.

**From Task 3.2:**

- Backend has `PUT /api/moderator-app/push-token`, which persists push token, platform, and app version on the current `ModeratorSession`.
- Backend does not send push notifications yet.
- Push support should remain no-cost/prototype-oriented in this phase.

## Objective

Prototype app-side push notification registration and document grouped new-photo alert behavior for moderator devices.

## Detailed Instructions

1. Work in `apps/moderator` and keep guest upload out of scope.
2. Add app-side notification permission/token registration using Expo APIs where practical.
3. Register/update push token through `PUT /api/moderator-app/push-token` when a valid app session exists.
4. Handle unsupported environments gracefully:
   - web;
   - simulator/emulator limitations;
   - missing physical device permissions;
   - no Expo project credentials.
5. Do not introduce paid services.
6. Do not implement backend push dispatch unless it is a clearly isolated no-cost stub. Backend currently persists token only.
7. Document grouped/throttled new-photo notification behavior for future backend implementation:
   - avoid one notification per photo during bursts;
   - avoid sensitive photo/guest data on lock screen;
   - include fallback when push fails.
8. Update `apps/moderator/README.md` or a relevant doc with setup, validation, and limitations.
9. Run the strongest available validation:
   - `rtk proxy pnpm --filter @eventoon/moderator-app typecheck`
   - any additional static check available.

## Workspace

Use this worktree for edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-push-notification-prototype`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/push-notification-prototype`

Do not merge.

## Expected Output

App-side push registration plus backend-compatible integration documentation or implementation for grouped pending-photo alerts.

## Validation Criteria

- App requests/registers notification token where supported, or clearly reports unsupported environment.
- Push token registration calls the existing backend endpoint when session exists.
- Grouping/throttling behavior is documented.
- Failure modes do not block upload, moderation, or web fallback.
- `rtk proxy pnpm --filter @eventoon/moderator-app typecheck` passes, or blockers are documented precisely.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, preserve existing production web flow safety, document the discrepancy in the Task Log, and proceed with the safest prototype.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-03/task-03-04.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/native-app-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports native-app-agent`.
