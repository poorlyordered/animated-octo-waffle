# Feature Specification: Numbers Approval Handoff

**Feature Branch**: `017-numbers-approval-handoff`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M17: Browser-visible approval handoff from Numbers-created decisions into queued work."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Follow-Up Approval State (Priority: P1)

As a commander, I want a Numbers-created decision to show whether it is proposed, approval-blocked, or queue-ready so that I understand the handoff from observation to approved work.

**Why this priority**: M11 can create decisions and queue work, but the browser state does not clearly explain the approval gateway between those actions.

**Independent Test**: Create or surface a Numbers follow-up decision and verify the response and browser card show decision status, approval requirement, queue readiness, and no-execution boundary.

**Acceptance Scenarios**:

1. **Given** a Numbers follow-up decision is proposed, **When** it is surfaced in the browser, **Then** the handoff says approval is required before queue creation.
2. **Given** a Numbers follow-up decision is approved, **When** it is surfaced in the browser, **Then** the handoff says queued work can be created from that decision.
3. **Given** a player-impacting follow-up is not approved, **When** the commander inspects it, **Then** the handoff explains that explicit commander approval is required.

---

### User Story 2 - Show Queue Linkage After Approved Handoff (Priority: P2)

As a commander, I want queued work created from an approved Numbers decision to show the source decision and queue item linkage so that I can audit the handoff without confusing it for execution.

**Why this priority**: Queue creation is a command artifact, not execution. The handoff should identify the decision and queue item as linked artifacts.

**Independent Test**: Create queued work from an approved Numbers follow-up decision and verify response/UI include queue item id, source decision id, queued status, and no-dispatch boundary.

**Acceptance Scenarios**:

1. **Given** an approved Numbers follow-up decision, **When** queued work is created, **Then** the response includes a handoff summary with queue item id and decision id.
2. **Given** queued work already exists, **When** the commander queues the same follow-up again, **Then** the existing queue item and handoff summary are surfaced as duplicate-safe.
3. **Given** the handoff is displayed, **When** the commander reads it, **Then** it does not imply worker dispatch, retry scheduling, EVE writes, wallet/asset movement, contract mutation, role changes, or external execution.

---

### User Story 3 - Block Unsafe Approval Handoff Inputs (Priority: P3)

As a commander, I want browser-controlled approval or execution-like inputs rejected so that Numbers handoff status stays server-owned and auditable.

**Why this priority**: Approval and queue status must come from stored decision/queue records, not browser-provided overrides.

**Independent Test**: Submit forged approval, provenance, queue linkage, dispatch, retry, EVE write, wallet, asset, or external execution fields and verify they are rejected without mutation.

**Acceptance Scenarios**:

1. **Given** a browser request includes approval or queue handoff overrides, **When** the server handles it, **Then** the unsafe field is rejected.
2. **Given** a queue request references a decision that does not match the Numbers follow-up origin, **When** the request is handled, **Then** queue creation is refused.
3. **Given** browser responses include handoff status, **When** they are serialized, **Then** they contain no secrets, tokens, worker secrets, dispatch targets, or execution handles.

---

### Operating Model Alignment

- **Numbers**: Primary source. The slice clarifies the approval gateway for Numbers follow-up decisions and queued work.
- **Opportunity**: Market/logistics findings may be represented as opportunity-oriented follow-up work, but M17 does not ingest Opportunity data.
- **People**: People impacts are represented only through existing approval boundaries; M17 does not mutate people records.
- **Decision Boundary**: Shows observation -> decision -> approved queued work status. It does not approve decisions itself.
- **Automation Boundary**: Queue creation remains preparation only. No worker dispatch, handoff claim, retry scheduling, EVE write, wallet/asset movement, contract mutation, role change, or external-service execution occurs.

### Edge Cases

- Follow-up candidate no longer exists in the latest snapshot.
- Existing decision is proposed, approved, rejected, delegated, done, or player-impacting without approval.
- Existing queue item already exists for the approved decision and task intent.
- Queue request references a decision from another candidate, snapshot, or corporation scope.
- Browser tries to provide approval, handoff, queue status, provenance, worker, retry, EVE write, wallet, asset, contract, role, or external execution fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include browser-safe approval handoff metadata in Numbers follow-up decision responses.
- **FR-002**: Approval handoff metadata MUST include candidate id, snapshot id, decision id, decision status, approval requirement, queue readiness, and boundary language.
- **FR-003**: System MUST include browser-safe approval handoff metadata in Numbers follow-up queue responses.
- **FR-004**: Queue handoff metadata MUST include source decision id, queue item id, queue status, duplicate state, and no-dispatch boundary language.
- **FR-005**: System MUST derive approval handoff state from stored decision and queue records, not browser-provided approval or queue metadata.
- **FR-006**: System MUST surface existing decisions and existing queue items with handoff metadata instead of creating duplicates.
- **FR-007**: Browser UI MUST render proposed, approved/queue-ready, queued, duplicate, and blocked handoff states.
- **FR-008**: System MUST reject browser-controlled approval, queue handoff, provenance, dispatch, retry, EVE write, wallet, asset, contract, role, and external execution fields.
- **FR-009**: System MUST NOT approve decisions, dispatch workers, claim handoffs, schedule retries, run retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services in this slice.
- **FR-010**: API and browser responses MUST exclude access tokens, refresh tokens, sealed token material, MongoDB credentials, cookie signatures, worker secrets, dispatch targets, and execution handles.
- **FR-011**: Contract/unit and browser smoke tests MUST cover approval handoff metadata, queue linkage, duplicate surfacing, unsafe field rejection, and no-execution language.

### Key Entities *(include if feature involves data)*

- **NumbersApprovalHandoff**: Browser-safe state summary for the handoff from a Numbers follow-up candidate to a decision and optional queued work.
- **NumbersFollowUpCandidate**: Existing processed Numbers recommendation.
- **DecisionRecord**: Existing command decision artifact that gates queue creation.
- **AutomationQueueItem**: Existing queued work artifact created only from an approved decision.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A proposed Numbers follow-up decision response tells the commander approval is required before queue creation.
- **SC-002**: An approved Numbers follow-up decision response tells the commander queued work can be created.
- **SC-003**: A queue creation response tells the commander which decision and queue item are linked and that no execution occurred.
- **SC-004**: Duplicate decision and queue responses include the same browser-safe handoff metadata as first-time creations.
- **SC-005**: Unsafe browser handoff overrides are rejected by contract/unit tests.
- **SC-006**: Existing lint, typecheck, unit/contract tests, browser smoke tests, and production build continue to pass.

## Assumptions

- Existing decision status update/approval workflows remain outside M17.
- M17 does not add new durable collections; handoff metadata is computed from existing Numbers, decision, and queue records.
- Queue creation remains server-owned and requires existing approved decision rules.
