---
title: Revela Fase 2
modified: Spec creation by Planner.
---

# APM Spec

## Overview

Revela is a private event photo wall product where guests upload media through QR-based web flows, moderators review content, and a live screen displays approved moments during the event. Fase 2 evolves the validated MVP into a more reliable event-operation product while preparing the foundation for a native moderator app. The immediate operational target is the event on 2026-07-11, with a desired delivery window by 2026-07-10. Success means the production web app remains stable, moderation becomes safer and faster, event-level moderation can be disabled when appropriate, and the native-app/video directions are advanced without risking the live event.

## Workspace

- Primary working repository: `/Users/gersonvan/Documents/EventoOn`.
- Production application domain: `https://revela.gersonvan.com.br`.
- Production platform: Vercel, PostgreSQL, Prisma 7, Next.js App Router, Auth.js Google admin login, Cloudflare R2-capable storage adapter.
- Main source directories:
  - `src/app`: Next.js routes for admin, guest upload, moderation, screen, APIs, and media.
  - `src/components`: reusable UI and client behavior for upload, moderation, and screen.
  - `src/lib`: admin access, moderation access, storage, QR generation, email, Prisma.
  - `prisma`: schema and migrations.
  - `docs`: current product, architecture, operation, deploy, and roadmap docs.
  - `design`: versioned design handoff assets.
- APM files are installed in `.apm/`, `.agents/`, and `.codex/`.
- No pre-existing root `AGENTS.md` was found during planning. A new APM rules block will be created.
- Authoritative planning inputs:
  - `docs/PRD.md`
  - `docs/BACKLOG.md`
  - `docs/ROADMAP.md`
  - `docs/STATUS_IMPLEMENTACAO.md`
  - `docs/OPERACAO_EVENTO.md`
  - `docs/DESIGN_HANDOFF.md`
  - `design/HANDOFF_LANDING.md`
  - recent live-event discussion and post-event commits.

---

> **Notes:** The current docs contain useful historical context but several files have truncated or corrupted sections. Treat them as authoritative for intent, not as clean execution references until the documentation cleanup is complete. The Git branch is `main`; recent work has been committed and deployed continuously. There are local untracked `.agents/`, `.apm/`, and `.codex/` directories from the APM installation.

## Product Direction

Fase 2 is an operational product phase, not a rebuild. The existing production MVP must remain usable throughout the work. The project should improve the real event workflow while moving toward a reusable/commercial product.

The event on 2026-07-11 is the near-term operational anchor. Work that protects that event takes precedence over larger strategic exploration. Native app and video work are important, but must not destabilize the web flow that already worked in a real party.

Billing and real plan enforcement are outside this phase. Landing-page and pricing design may remain present as product direction, but no production charging flow should be introduced.

## Guest Experience

Guests should continue using the web upload flow accessed by QR Code. The live event confirmed that guests liked this model, and requiring installation for guests would add friction.

The guest flow should stay mobile-first, fast, and clear. The name/apelido field is mandatory and must remain visually obvious because users previously skipped or misunderstood it. Upload success/failure feedback must remain explicit.

An app for guests is not a Fase 2 priority. Any native app work should first serve moderators.

## Moderation Modes

Each event must support a simple moderation-mode setting:

| Mode | Behavior |
| --- | --- |
| Com moderacao | Uploaded photos enter as pending and require approval before appearing on the screen. |
| Sem moderacao | Uploaded photos are automatically approved and can appear on the screen without review. |

The first implementation should be event-level, not per media type, table, or time window. More granular controls can be considered later.

When an event is configured without moderation, admin UI must show a strong warning that photos will appear directly on the screen. This warning should reduce accidental activation.

Even when moderation is disabled, admins and moderators must be able to remove/reject content after it appears. The system should preserve a useful history of how a photo reached its state, including automatic approval when applicable.

## Moderator Web Fallback

The existing web moderation experience remains the operational fallback for the 2026-07-11 event. Native app work must not block the current `/moderate/[token]` flow.

Web moderation should be improved for mobile use because moderators commonly operate from phones during events. The interface should prioritize large touch targets, fast review, clear pending counts, and low risk of accidental destructive actions.

PWA is allowed only as contingency if native app distribution is not viable in time. PWA is not the preferred product direction.

## Native Moderator App

The native app direction is Android/iOS with Expo/React Native. The first app should target moderators, not guests.

The moderator app should support:

- login/access from an e-mail invitation;
- event-scoped moderation access;
- device/session registration for push notifications;
- viewing pending photos;
- approving and rejecting photos;
- receiving push notifications when new photos arrive;
- notification grouping to avoid excessive alerts during upload bursts.

The intended access model is invitation by e-mail. The invitation establishes that a moderator is authorized for an event, and the app should bind a session/device to that moderator/event.

Push should notify moderators when any new photo arrives for moderation. In bursts, notifications should be grouped or throttled so moderators receive useful alerts rather than one alert per photo.

App Store and Google Play publication are desirable but not guaranteed for the 2026-07-10 target because Apple Developer and Google Play Developer accounts are not yet active. A testable/installable build is an acceptable near-term outcome if store distribution is blocked.

## Video Direction

Video support in Fase 2 is a technical proof, not the main event flow. It should not be required for the 2026-07-11 event operation.

The proof should study and, where feasible, prototype:

- accepting a sample video input;
- producing short clips between 5 and 10 seconds;
- estimating storage and processing costs;
- deciding whether original videos are retained temporarily, retained in a future paid plan, or discarded after processing;
- understanding how optimized video clips might later be shown on the screen.

The proof must prioritize low-cost/free infrastructure. Any architecture that creates recurring storage, bandwidth, or compute costs must make those costs visible before becoming product direction.

## Documentation Direction

Documentation cleanup is part of the Fase 2 scope. The current product documents contain corrupted/truncated sections and should be rewritten or repaired to match the real production state and Fase 2 decisions.

Clean documentation should cover:

- current MVP state;
- Fase 2 scope and non-scope;
- moderation modes;
- moderator app direction;
- push notification strategy;
- video proof direction;
- operational runbook for the 2026-07-11 event;
- validation and deployment commands.

The cleaned docs should be clear enough for future APM Manager/Worker execution and for human review.

## Infrastructure And Cost Constraints

The project should maximize free-tier and low-cost infrastructure. This is a hard planning constraint for new services.

Cost-sensitive areas include:

- native app build/distribution services;
- push notification services;
- video processing;
- media storage;
- bandwidth for screen and guest uploads;
- any new database or background job infrastructure.

Use existing infrastructure where practical: Vercel, PostgreSQL, Cloudflare R2-capable storage, and the current Next.js application. New providers or paid services should be introduced only when their necessity is explicit.

## Production Quality Constraints

Production stability matters more than exploratory completeness. Changes should be small enough to validate and deploy continuously.

Expected validation for implementation work includes:

- lint;
- typecheck;
- build;
- smoke checks or browser checks when relevant;
- commit and push;
- production deploy when a user-facing change is ready.

The production web flow must remain usable throughout the phase.

## Out Of Scope

The following are outside the immediate Fase 2 implementation scope:

- real billing or payment enforcement;
- guaranteed App Store or Google Play approval by 2026-07-10;
- native guest app as a priority;
- full production video workflow for the 2026-07-11 event;
- AI moderation;
- facial recognition;
- complete commercial SaaS back office.
