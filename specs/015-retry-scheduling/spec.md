# Feature Specification: Retry Scheduling

**Feature Branch**: `015-retry-scheduling`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M15: Worker retry policy and commander-approved retry scheduling for failed handoffs and failed ESI syncs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schedule Failed Handoff Retry (Priority: P1)

As a commander, I want to schedule a retry record for a failed worker handoff so that failed queued work can be prepared for a future worker without being retried immediately.

**Why this priority**: Failed handoffs are already visible. M15 needs a controlled commander-approved retry path before any automated retry execution exists.

**Independent Test**: Seed a failed worker handoff, schedule a retry with a reason and optional not-before timestamp, and verify an auditable retry record is created without dispatching a worker or changing the failed handoff to ready.

**Acceptance Scenarios**:

1. **Given** a worker handoff is failed, **When** the commander schedules a retry, **Then** a retry record is created with target id, reason, status `scheduled`, created timestamp, and no worker dispatch.
2. **Given** the same failed handoff already has a scheduled retry, **When** the commander schedules again, **Then** the existing retry is surfaced instead of creating a duplicate.
3. **Given** a handoff is ready, claimed, completed, blocked, or cancelled, **When** retry is requested, **Then** the system refuses and explains that only failed handoffs are retry-eligible.

---

### User Story 2 - Schedule Failed ESI Sync Retry (Priority: P2)

As a commander, I want to schedule a retry record for a failed Numbers ESI sync so that ingestion can be retried later under policy without running ESI work in the browser request.

**Why this priority**: M14 exposes failed ESI sync history. Scheduling retry requests makes failures actionable while preserving the request/worker boundary.

**Independent Test**: Seed a failed Numbers ESI sync request, schedule a retry, and verify a browser-safe retry record is returned without token refresh, ESI fetch, or sync request mutation to queued.

**Acceptance Scenarios**:

1. **Given** a Numbers ESI sync request is failed, **When** the commander schedules retry, **Then** a retry record is created with target type `esi_sync_request`, domain, reason, and no execution metadata.
2. **Given** a sync request belongs to another corporation, **When** retry is requested, **Then** it is not visible or schedulable.
3. **Given** the vault is revoked or consent is missing, **When** retry is scheduled, **Then** the retry record can still capture intent but says future execution remains blocked until valid consent exists.

---

### User Story 3 - Inspect Retry Status In Command Surfaces (Priority: P3)

As a commander, I want failed handoffs and failed ESI syncs to show retry eligibility and scheduled retry status so that I can understand what is pending without confusing it for execution.

**Why this priority**: Retry scheduling must be auditable and visibly distinct from worker dispatch or game actions.

**Independent Test**: Seed scheduled retry records for a failed handoff and failed ESI sync, load the automation queue and ESI sync surfaces, and verify retry status, reason, created time, no-execution boundary, and duplicate behavior are visible.

**Acceptance Scenarios**:

1. **Given** a failed handoff has a scheduled retry, **When** the commander views queue detail, **Then** retry status and reason are shown.
2. **Given** a failed ESI sync has a scheduled retry, **When** the commander views ESI sync history, **Then** retry status and reason are shown.
3. **Given** retry status is shown, **When** the UI renders controls, **Then** it does not claim, dispatch, execute, refresh tokens, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or call external services.

---

### Operating Model Alignment

- **Numbers**: M15 applies to failed Numbers ESI sync requests and keeps retry scheduling auditable.
- **Opportunity**: Retry policy may later support opportunity ingestion, but M15 does not add Opportunity retries.
- **People**: Retry policy may later support people ingestion, but M15 does not mutate people records.
- **Decision Boundary**: Retry scheduling is an approved commander intent record, not execution.
- **Automation Boundary**: M15 creates retry records only. It MUST NOT dispatch workers, retry immediately, refresh tokens, fetch ESI data, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions.

### Edge Cases

- Target handoff or sync request is missing, belongs to another corporation, or is not failed.
- A scheduled retry already exists for the failed target.
- Browser request includes execution flags, worker dispatch fields, token material, retry-run-now flags, corporation overrides, wallet or asset actions, contract actions, role changes, or external mutation fields.
- Not-before timestamp is omitted, malformed, or in the past.
- Failed ESI sync exists but the vault is missing or revoked.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow commander-scoped retry scheduling for failed worker handoffs.
- **FR-002**: System MUST allow commander-scoped retry scheduling for failed Numbers ESI sync requests.
- **FR-003**: System MUST create browser-safe retry records with target type, target id, reason, status, created timestamp, optional not-before timestamp, and boundary language.
- **FR-004**: System MUST surface existing scheduled retry records instead of creating duplicates for the same target.
- **FR-005**: System MUST reject retry scheduling for non-failed handoffs or sync requests.
- **FR-006**: System MUST scope retry scheduling and visibility to the active corporation.
- **FR-007**: System MUST display scheduled retry status in queue detail and ESI sync history.
- **FR-008**: System MUST reject or ignore token material, corporation overrides, dispatch fields, run-now flags, retry execution flags, EVE write flags, wallet actions, asset actions, contract actions, role changes, and external-service mutation fields.
- **FR-009**: System MUST NOT claim handoffs, dispatch workers, create ready handoffs, mutate failed sync requests to queued, refresh tokens, fetch ESI data, write to EVE, move wallets, move assets, mutate contracts, change roles, or execute external-service actions in this slice.
- **FR-010**: System MUST keep tokens, sealed token material, worker secrets, MongoDB credentials, dispatch targets, execution handles, and raw ESI payloads out of retry responses.
- **FR-011**: System MUST cover retry eligibility, duplicate retry handling, scope enforcement, unsafe field rejection, and browser display with contract/unit and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **RetryRequest**: Auditable commander-approved retry scheduling record for a failed handoff or failed ESI sync request.
- **RetryTargetType**: Target category: `worker_handoff` or `esi_sync_request`.
- **WorkerHandoff**: Existing handoff record that is retry-eligible only when failed.
- **EsiSyncRequest**: Existing sync request record that is retry-eligible only when failed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can schedule retry for a failed handoff and see a scheduled retry record without the handoff being claimed or dispatched.
- **SC-002**: A commander can schedule retry for a failed Numbers ESI sync and see a scheduled retry record without an ESI fetch or token refresh.
- **SC-003**: Duplicate retry scheduling returns the existing scheduled record.
- **SC-004**: Non-failed targets cannot be scheduled for retry.
- **SC-005**: Retry responses and browser surfaces contain no token material, worker secrets, dispatch targets, execution handles, or raw ESI payloads.
- **SC-006**: Existing command brief, decision, automation queue, people, session, ESI vault, Numbers, worker ingestion, handoff, worker callback, sync history, browser smoke, typecheck, lint, and build validations continue to pass.

## Assumptions

- M15 stores retry scheduling records separately from handoff and sync request state.
- M15 supports failed worker handoffs and failed Numbers ESI sync requests first.
- Actual retry execution, worker dispatch, backoff workers, and retry cancellation remain future slices.
