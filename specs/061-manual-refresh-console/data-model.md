# Data Model: Manual Refresh Console

## Refresh Mode

Represents commander intent for a refresh run.

Fields:

- `mode`: `evaluate_existing`, `prepare_sources`, or `full_refresh`
- `label`: Browser-safe display label
- `boundary`: No-execution boundary for the selected mode

Validation:

- `evaluate_existing` may be selected when at least one existing command artifact can be evaluated or readiness explicitly says data is partial.
- `prepare_sources` and `full_refresh` may prepare source requests but still do not fetch data or dispatch workers from browser paths.

## Refresh Readiness Checklist

Browser-safe readiness state for the current command scope.

Fields:

- `items`: Readiness items
- `overallStatus`: `ready`, `blocked`, or `degraded`
- `boundary`: Shared no-execution boundary
- `createdAt`: Timestamp when readiness was computed

Readiness Item fields:

- `key`: Stable item key such as `session`, `corporation`, `esi_vault`, `worker_callback`, `model_provider`, `storage`
- `label`: Display label
- `status`: `ready`, `blocked`, `warning`, or `unknown`
- `reason`: Safe explanation
- `requiredAction`: Commander-facing next action when not ready
- `safeDetails`: Bounded safe facts with no secrets or raw payloads

## Refresh Run

Extends existing Intelligence Refresh Run.

Added/clarified fields:

- `mode`: Refresh mode selected at creation
- `statusExplanation`: Board-safe explanation for current status
- `events`: Not embedded in list summaries; available on detail response

Existing fields retained:

- `id`, `corporationId`, `requestedBy`, `requestedDomains`, `status`, `steps`, `evaluation`, `policy`, timestamps, warnings, boundary

State rules:

- Duplicate active runs are deduped by corporation, mode, and effective domain set.
- Terminal runs clear active-run dedupe state.
- Run summaries stay bounded for list responses.

## Refresh Step Timeline Item

Browser-focused view of a run step.

Fields:

- `stepId`
- `domain`
- `technicalStatus`
- `statusLabel`
- `statusTone`: `ready`, `processing`, `warning`, `blocked`, `failed`, or `complete`
- `owner`
- `startedAt`, `completedAt`, `failedAt`, `skippedAt`
- `blocker`
- `failure`
- `warnings`
- `artifactLinks`
- `canRetry`
- `canSkip`
- `nextAction`

Validation:

- Labels must be specific. Generic `processing` is not a valid status label.
- Retry is available only for failed or blocked eligible steps.
- Skip is available only where partial evaluation can remain valid.

## Refresh Run Event

Durable chronological event for a run.

Fields:

- `id`
- `runId`
- `corporationId`
- `eventType`: `run_created`, `readiness_checked`, `step_prepared`, `step_claimed`, `step_completed`, `step_failed`, `step_retry_requested`, `step_skipped`, `evaluation_started`, `evaluation_completed`, `evaluation_failed`
- `actor`: Safe actor label such as `session:<character>` or `worker:<id>`
- `stepId`
- `domain`
- `message`
- `safeDetails`
- `artifactLinks`
- `createdAt`

Validation:

- Event payloads must reject secrets, raw provider payloads, raw ESI payloads, dispatch handles, and mutation fields.
- Events are scoped by corporation and run id.

## Board Status Explanation

Summary shown on command board surfaces when a refresh run affects visible state.

Fields:

- `surface`: `brief`, `numbers`, `opportunity`, `people`, `refresh`, or related command surface
- `label`
- `tone`
- `runId`
- `href`
- `reason`
- `nextAction`

Validation:

- If `runId` is present, it must be scoped to the current corporation.
- Labels must map stale, active, failed, blocked, and missing states to actionable language.
