# Feature Specification: Worker Handoff Callbacks

**Feature Branch**: `010-worker-callbacks`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M10: Add worker polling, claim, progress, completion, and failure callbacks for prepared worker handoff records. Workers should be able to inspect ready handoffs, claim one atomically, report safe progress metadata, mark completion or failure, and preserve auditability without executing EVE actions in request handlers or exposing worker secrets to browser APIs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Worker Claims Prepared Handoff (Priority: P1)

A trusted worker can ask for ready handoff records and claim one so duplicate workers do not process the same prepared queue item.

**Why this priority**: M7 created durable handoff records but left workers without a controlled way to pick up work. Atomic claim is the smallest useful execution-loop bridge.

**Independent Test**: Seed ready handoff records, call the worker claim endpoint, and verify exactly one ready handoff becomes claimed with worker metadata and timestamps.

**Acceptance Scenarios**:

1. **Given** a ready handoff record for the active corporation, **When** a worker claims it, **Then** the system marks it claimed, records worker identity, records claim time, and returns the handoff payload summary.
2. **Given** a handoff that is already claimed, completed, failed, cancelled, or scoped to another corporation, **When** a worker tries to claim it, **Then** the system rejects the claim or returns no claimable work.

---

### User Story 2 - Worker Reports Progress And Completion (Priority: P2)

A trusted worker can report safe progress and final completion metadata so commanders can inspect what happened without reading raw worker logs.

**Why this priority**: Automation must expose status, inputs, outputs, timestamps, failures, and retry behavior. Progress/completion callbacks make worker activity auditable.

**Independent Test**: Claim a handoff, send progress metadata, then complete it and verify status, timestamps, output summary, and audit trail are visible through existing handoff reads.

**Acceptance Scenarios**:

1. **Given** a claimed handoff, **When** the assigned worker reports progress, **Then** the system records a safe progress event without changing queue execution state or exposing secrets.
2. **Given** a claimed handoff, **When** the assigned worker completes it, **Then** the system marks it completed, records completion time, stores a safe output summary, and keeps the handoff inspectable.

---

### User Story 3 - Worker Reports Failure Safely (Priority: P3)

A trusted worker can report failure metadata for a claimed handoff so commanders can understand what blocked the work.

**Why this priority**: Failure visibility is required before retries or external action decisions can be responsibly added later.

**Independent Test**: Claim a handoff, fail it with a safe message/code, and verify the failure appears in browser-safe handoff summaries with no secret or raw-token exposure.

**Acceptance Scenarios**:

1. **Given** a claimed handoff, **When** the assigned worker reports failure, **Then** the system marks it failed, records failure time, code, and message, and preserves worker identity.
2. **Given** a failure payload containing secret-like or execution-control fields, **When** the callback is processed, **Then** the system stores only safe failure metadata and ignores or rejects unsafe fields.

---

### Operating Model Alignment

- **Numbers**: Worker callbacks may process numbers-related handoffs and expose their status, but this slice does not add new numbers analytics.
- **Opportunity**: Worker callbacks may process opportunity-related handoffs and expose their status, but this slice does not add new opportunity recommendations.
- **People**: Worker callbacks may process people-related handoffs and expose their status, but this slice does not add new member or role actions.
- **Decision Boundary**: Observation only. Worker callbacks record handoff status and safe summaries; they do not approve, draft, or execute player-impacting actions.
- **Automation Boundary**: Safe callback automation. Workers can claim and report status for already prepared handoffs, but request handlers do not perform EVE actions, external dispatch, retries, wallet/asset changes, role changes, or service mutations.

### Edge Cases

- No ready handoffs exist for the active corporation.
- Multiple workers try to claim the same ready handoff.
- A worker tries to update a handoff it did not claim.
- A worker tries to complete or fail a handoff that is not claimed.
- Worker callback body is invalid JSON or missing required fields.
- Worker callback includes browser/user-controlled corporation scope, status overrides, execution flags, dispatch targets, tokens, or credentials.
- Completion/failure payload is too verbose or contains raw external output that should not be browser-visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a worker-readable list of ready handoffs scoped to the active corporation.
- **FR-002**: System MUST support atomic worker claim of a ready handoff.
- **FR-003**: System MUST record worker identity, claim time, and update time when a handoff is claimed.
- **FR-004**: System MUST reject claim attempts for handoffs that are not ready or are outside the active corporation scope.
- **FR-005**: System MUST allow the claiming worker to append safe progress metadata to a claimed handoff.
- **FR-006**: System MUST allow the claiming worker to mark a claimed handoff completed with a safe output summary.
- **FR-007**: System MUST allow the claiming worker to mark a claimed handoff failed with safe failure metadata.
- **FR-008**: System MUST reject progress, completion, or failure callbacks from workers that did not claim the handoff.
- **FR-009**: System MUST keep worker tokens, secrets, credentials, dispatch targets, and raw external payloads out of browser-visible handoff responses.
- **FR-010**: System MUST preserve existing commander handoff list/detail APIs and queue-detail handoff summaries.
- **FR-011**: System MUST not dispatch workers, retry work, perform EVE actions, mutate external services, or execute player-impacting actions inside callback request handlers.
- **FR-012**: System MUST surface safe progress, completion, and failure metadata through existing handoff reads.

### Key Entities *(include if feature involves data)*

- **Worker Handoff Claim**: Worker identity and claim timestamp recorded when a ready handoff becomes claimed.
- **Worker Progress Event**: Safe status note recorded by the claiming worker while work is in progress.
- **Worker Completion Result**: Safe output summary recorded when claimed work completes.
- **Worker Failure Result**: Safe failure metadata recorded when claimed work fails.
- **Worker Callback Credential**: Server-side credential used to authorize worker callbacks; it is never exposed to browser responses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Automated tests prove only one worker can claim a ready handoff.
- **SC-002**: Automated tests prove non-claiming workers cannot update claimed handoffs.
- **SC-003**: Claimed, progress, completed, and failed states are visible through handoff read contracts without exposing secrets or raw callback payloads.
- **SC-004**: Existing M7 handoff preparation, list/detail, queue-detail, and browser smoke behavior continues to pass.
- **SC-005**: Full local validation covers lint, typecheck, unit/contract tests, browser smoke tests, and production build.

## Assumptions

- This slice uses a shared server-side worker callback secret for local/API authorization; a richer worker identity provider can be added later.
- Worker callbacks are status/audit callbacks only. They do not cause Gryyk-47 request handlers to perform game actions or external dispatch.
- Existing `worker_handoffs` records can be extended with claim/progress/result fields while preserving existing response compatibility.
- Retry policy and worker scheduling remain future slices.
