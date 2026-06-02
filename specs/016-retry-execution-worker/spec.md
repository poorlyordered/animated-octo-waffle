# Feature Specification: Retry Execution Worker

**Feature Branch**: `016-retry-execution-worker`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M16: Retry execution worker that consumes scheduled retry requests under commander-approved policy."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Execute Scheduled Handoff Retry (Priority: P1)

As a commander, I want a trusted worker to consume a scheduled retry for a failed worker handoff so that approved failed work can be prepared again without browser-triggered execution.

**Why this priority**: M15 created commander-approved retry intent records. The first useful M16 increment is a worker-only path that turns a scheduled failed handoff retry into a fresh ready handoff while preserving auditability and command boundaries.

**Independent Test**: Seed a failed worker handoff with a scheduled retry request, call the trusted worker retry execution endpoint, and verify the retry is completed with a new ready handoff while no browser endpoint dispatches or claims work.

**Acceptance Scenarios**:

1. **Given** a scheduled retry targets a failed worker handoff, **When** a trusted retry worker executes it, **Then** the retry request is marked `completed`, a replacement handoff is prepared in `ready` state, and both records link to each other.
2. **Given** a retry targets a failed handoff that is no longer retry-eligible, **When** the worker executes it, **Then** the retry request is marked `blocked` with a safe reason and no replacement handoff is created.
3. **Given** a retry has a future not-before timestamp, **When** the worker lists ready retries, **Then** the retry is omitted until the timestamp has passed.

---

### User Story 2 - Execute Scheduled ESI Sync Retry (Priority: P2)

As a commander, I want a trusted worker to consume a scheduled retry for a failed Numbers ESI sync so that read-sync work can be queued again under policy without exposing token material or running ESI in request paths.

**Why this priority**: Failed Numbers syncs are the main Numbers retry target. M16 should requeue a fresh sync request only from scheduled commander intent and only through a trusted worker path.

**Independent Test**: Seed a failed Numbers ESI sync request with a scheduled retry, call the trusted worker retry execution endpoint, and verify the retry is completed with a new queued sync request without token refresh, ESI fetch, or browser token exposure.

**Acceptance Scenarios**:

1. **Given** a scheduled retry targets a failed Numbers ESI sync request, **When** a trusted retry worker executes it, **Then** the retry is marked `completed`, a fresh sync request is created in `queued` state, and no ESI fetch occurs.
2. **Given** the target sync request belongs to another corporation, **When** the worker executes the retry under the active worker policy, **Then** the retry is blocked or not visible and no new sync request is created.
3. **Given** the target sync request lacks active vault consent, **When** the worker executes the retry, **Then** the retry is blocked with a safe consent reason and no token material is returned.

---

### User Story 3 - Inspect Retry Execution Outcomes (Priority: P3)

As a commander, I want retry execution outcomes to appear next to failed handoffs and failed syncs so that I can tell whether retry intent is still scheduled, completed, or blocked.

**Why this priority**: Execution must be auditable. The browser should see status and linkage, but never receive worker secrets, token material, dispatch handles, or raw ESI payloads.

**Independent Test**: Seed scheduled, completed, and blocked retry requests for failed handoff and sync targets, load automation queue detail and ESI sync history, and verify browser-safe execution summaries are visible.

**Acceptance Scenarios**:

1. **Given** a failed handoff retry was completed, **When** the commander views queue detail, **Then** the retry status, worker id, completed timestamp, and replacement handoff id are visible.
2. **Given** a failed ESI sync retry was blocked, **When** the commander views ESI sync history, **Then** the safe block reason is visible without token material.
3. **Given** retry execution status is displayed, **When** the UI renders, **Then** it remains distinct from browser-triggered execution and does not offer run-now controls.

---

### Operating Model Alignment

- **Numbers**: Applies to failed Numbers ESI sync requests and prepares new queued read-sync work.
- **Opportunity**: Retry execution policy may later support opportunity ingestion, but M16 does not add Opportunity targets.
- **People**: Retry execution policy may later support people ingestion, but M16 does not mutate people records.
- **Decision Boundary**: Retry execution consumes previously approved commander intent; the browser sees outcomes but cannot execute retries.
- **Automation Boundary**: Worker-only automated action with prior commander approval. M16 MAY create replacement ready handoffs or queued sync requests. It MUST NOT dispatch external workers, claim handoffs, fetch ESI data, refresh tokens, write to EVE, move wallets/assets/contracts, change roles, or execute external-service mutations in browser/request paths.

### Edge Cases

- Retry request is scheduled but not-before is in the future.
- Retry request is already claimed, completed, blocked, or cancelled.
- Target handoff or sync request is missing, not failed, belongs to another corporation, or has already been retried.
- Worker request is missing the trusted worker secret or includes browser-only identity overrides.
- ESI sync retry target no longer has active consent or required read scopes.
- Replacement handoff or sync creation succeeds but the retry completion update fails.
- Browser responses include retry execution outcomes while excluding secrets, token material, raw ESI payloads, dispatch handles, and external execution handles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose trusted-worker-only retry execution endpoints protected by the worker callback secret.
- **FR-002**: System MUST list only scheduled retry requests whose not-before timestamp is absent or due.
- **FR-003**: System MUST atomically claim a scheduled retry request before execution so duplicate workers cannot execute the same retry.
- **FR-004**: System MUST execute failed worker handoff retries by preparing a replacement ready handoff linked to the original failed handoff and retry request.
- **FR-005**: System MUST execute failed Numbers ESI sync retries by creating a replacement queued sync request linked to the original failed sync request and retry request.
- **FR-006**: System MUST mark retry requests as `completed` with worker id, completion timestamp, result summary, and replacement target id after successful preparation.
- **FR-007**: System MUST mark retry requests as `blocked` with a safe reason when the target is missing, not failed, out of scope, lacks active consent, or violates policy.
- **FR-008**: System MUST keep retry execution scoped to the retry target corporation and reject browser-controlled corporation overrides.
- **FR-009**: System MUST surface scheduled, claimed, completed, and blocked retry summaries in browser-safe command surfaces.
- **FR-010**: System MUST NOT dispatch external workers, claim handoffs, fetch ESI data, refresh tokens, write to EVE, move wallets, move assets, mutate contracts, change roles, or execute external-service actions in browser/request paths.
- **FR-011**: System MUST keep access tokens, refresh tokens, sealed token material, worker secrets, MongoDB credentials, raw ESI payloads, dispatch targets, and execution handles out of all browser responses.
- **FR-012**: System MUST cover worker authorization, ready listing, atomic claim, handoff retry completion, ESI sync retry completion, blocked outcomes, duplicate execution prevention, and browser-safe display with contract/unit and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **RetryRequest**: Auditable commander-approved retry request with scheduling, claim, completion, and blocked execution state.
- **RetryExecutionResult**: Safe summary of a retry worker outcome, including worker id, status, timestamp, replacement target id, and safe reason when blocked.
- **WorkerHandoff**: Existing failed handoff target and replacement ready handoff created by a handoff retry.
- **EsiSyncRequest**: Existing failed sync target and replacement queued sync request created by an ESI sync retry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A trusted worker can execute one scheduled failed handoff retry and create exactly one replacement ready handoff.
- **SC-002**: A trusted worker can execute one scheduled failed Numbers ESI sync retry and create exactly one replacement queued sync request without fetching ESI data.
- **SC-003**: Two execution attempts against the same scheduled retry cannot create duplicate replacement targets.
- **SC-004**: Retry requests with future not-before timestamps are absent from ready listings until due.
- **SC-005**: Browser-visible retry outcomes include status and safe linkage while containing no token material, worker secrets, raw ESI payloads, dispatch targets, or external execution handles.
- **SC-006**: Existing command, decision, automation queue, people, session, ESI vault, Numbers, worker ingestion, handoff, worker callback, retry scheduling, sync history, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M15 retry requests are the source of truth for retry intent.
- M16 executes only `worker_handoff` and `esi_sync_request` retry targets.
- Handoff retry execution prepares a new handoff record but does not dispatch or claim a worker.
- ESI sync retry execution prepares a new queued sync request but does not refresh tokens or fetch ESI data.
- Retry cancellation, recurring retry policy, exponential backoff, Opportunity retries, People retries, and live worker scheduling remain future slices.
