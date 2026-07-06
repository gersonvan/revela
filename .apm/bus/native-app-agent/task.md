---
stage: 3
task: 3
agent: native-app-agent
log_path: ".apm/memory/stage-03/task-03-03.log.md"
has_dependencies: true
---

# Expo Moderator App Core

## Task Reference

Task 3.3 assigned to `native-app-agent`.

## Context Dependencies

This Task depends on app architecture and backend implementation.

**Same-agent context from Task 3.1:**

- App scope is moderators only; guest native app is out of scope.
- Web moderation remains fallback for the 2026-07-11 event.
- App should support invitation/login, event-scoped session, pending list, photo review, approve/reject, and error/empty/offline states.
- Read `docs/ARQUITETURA_APP_MODERADOR.md` for the app flow and screen contract.

**Cross-agent context from Task 3.2:**

Backend support now exists under `/api/moderator-app/*`:

- `POST /api/moderator-app/sessions`
- `GET /api/moderator-app/me`
- `GET /api/moderator-app/photos`
- `GET /api/moderator-app/photos/{photoId}`
- `POST /api/moderator-app/photos/{photoId}/decision`
- `PUT /api/moderator-app/push-token`
- `DELETE /api/moderator-app/sessions/current`

The backend added `ModeratorSession`, Bearer session auth, event-scoped photo endpoints, approve/reject decision endpoint, push-token persistence, logout, `scripts/smoke-moderator-app-api.mjs`, and `docs/API_APP_MODERADOR.md`. Local end-to-end backend smoke still requires Docker/Postgres.

## Objective

Build the first Expo/React Native moderator app prototype core for event-scoped moderation.

## Detailed Instructions

1. Create an Expo app workspace in an appropriate repository location, following the architecture document where practical.
2. Keep the implementation prototype-focused and low-cost. Do not add paid services.
3. Implement backend base URL configuration suitable for local/dev/prototype testing.
4. Implement invitation/session flow:
   - accept or enter invite token;
   - call `POST /api/moderator-app/sessions`;
   - persist session token locally;
   - restore session via `GET /api/moderator-app/me`;
   - logout via `DELETE /api/moderator-app/sessions/current`.
5. Implement pending photo list using `GET /api/moderator-app/photos?status=PENDING`.
6. Implement a simple photo review UI:
   - image;
   - guest name;
   - message;
   - uploaded time;
   - approve/reject actions.
7. Implement approve/reject using `POST /api/moderator-app/photos/{photoId}/decision`, updating local state after success.
8. Include empty/error/loading states.
9. Keep guest upload out of scope.
10. Document how to run the app prototype and any limitations.

## Workspace

Use this worktree for edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-expo-moderator-app-core`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/expo-moderator-app-core`

Do not merge.

## Expected Output

An Expo/React Native app prototype with login/access, session persistence, pending photo list, photo review UI, and approve/reject actions.

## Validation Criteria

- App code typechecks or passes the strongest available Expo/TypeScript validation.
- App can be configured with backend base URL.
- Session/token flow is implemented.
- Pending list and approve/reject API integration are implemented.
- Guest upload is not implemented.
- Run instructions and limitations are documented.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, preserve existing production web flow safety, document the discrepancy in the Task Log, and proceed with the safest prototype.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-03/task-03-03.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/native-app-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports native-app-agent`.
