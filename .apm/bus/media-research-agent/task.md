---
stage: 4
task: 2
agent: media-research-agent
log_path: ".apm/memory/stage-04/task-04-02.log.md"
has_dependencies: true
---

# Controlled Video Processing Spike

## Task Reference

Task 4.2 assigned to `media-research-agent`.

## Context Dependencies

Building on the video architecture study:

**From Task 4.1:**

- The recommended next step is an isolated local FFmpeg proof using sample videos.
- Do not wire video into guest upload, moderation, screen, export, or production event flows.
- Keep any storage proof isolated, preferably using local files or a clearly separated proof prefix if R2 is involved.
- Treat original retention as a cost/privacy decision: discard after processing, retain temporarily, or reserve long-term original retention for a future paid option.
- Cost concerns must remain explicit.

**Integration Approach:**

Use the new document `docs/ESTUDO_VIDEO_BAIXO_CUSTO.md` as the starting point. The spike can be a reproducible local script and documentation. It does not need production infrastructure.

## Objective

Build or outline a minimal controlled proof that transforms a sample video into a 5-10 second clip without touching production event behavior.

## Detailed Instructions

1. Work in the assigned worktree and read `docs/ESTUDO_VIDEO_BAIXO_CUSTO.md`.
2. Select the safest proof mechanism consistent with that study.
3. Prefer a local/dev-only script if practical. Keep sample inputs out of Git unless they are tiny and intentionally tracked; otherwise document where the operator places a sample file.
4. Produce or document a command that takes a sample video and outputs a short 5-10 second clip.
5. Capture output format, expected processing behavior, constraints, and failure modes.
6. Do not modify production upload, moderation, screen, or export behavior.
7. Document security, privacy, and cost implications, especially original-video handling.
8. If FFmpeg or an equivalent tool is unavailable in this environment, document the blocker precisely and provide a reproducible command/script path for when it is installed.

## Workspace

Use this worktree for edits and validation:

`/Users/gersonvan/Documents/EventoOn/.apm/worktrees/codex-video-processing-spike`

The main project root is:

`/Users/gersonvan/Documents/EventoOn`

Write logs and reports under the main project root `.apm/`, not the worktree copy.

Work on branch:

`codex/video-processing-spike`

Do not merge.

## Expected Output

A prototype script, sandboxed experiment, or documented reproducible proof that demonstrates video clipping feasibility or clearly documents the blocker.

## Validation Criteria

- Proof either produces a short clip from sample input or clearly documents why it could not run.
- Production photo upload behavior is not changed.
- Production moderation/screen/export behavior is not changed.
- Cost, security, and original-retention implications are noted.
- The proof is reproducible by another developer/operator.

## Instruction Accuracy

The objective and expected output are authoritative. If a detailed instruction conflicts with repository reality, use the objective, preserve project safety, document the discrepancy in the Task Log, and proceed with the safest spike.

## Task Logging

Write this Task Log to:

`/Users/gersonvan/Documents/EventoOn/.apm/memory/stage-04/task-04-02.log.md`

## Reporting Instructions

When complete, commit the branch and write your Task Report to:

`/Users/gersonvan/Documents/EventoOn/.apm/bus/media-research-agent/report.md`

Then tell the user to return to the Manager with `/apm-5-check-reports media-research-agent`.
