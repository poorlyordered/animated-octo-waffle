# Feature Specification: Worker Handoff For Automation Queue

**Feature Branch**: `007-worker-handoff`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Add worker handoff for queued automation records so approved, non-player-impacting queued work can be prepared for external workers through auditable dispatch payloads and status handoff metadata, without performing EVE writes, retries, or long-running processing inside Netlify request paths."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prepare Approved Queue Item For Worker Handoff (Priority: P1)

As a commander, I want an approved queued work item to produce a worker-ready handoff record so that external workers can pick up the task with grounded inputs and audit metadata.

**Why this priority**: The automation queue currently stores auditable work orders but has no structured bridge to worker execution. A handoff record is the smallest useful increment because it prepares work without silently executing it.

**Independent Test**: Create or seed an approved non-player-impacting queue item, request handoff preparation, and verify a handoff record is created with queue link, corporation scope, payload summary, status, timestamps, and no executed EVE action.

**Acceptance Scenarios**:

1. **Given** an approved queued work item that is safe for worker preparation, **When** the commander prepares handoff, **Then** the system creates a handoff record linked to that queue item and marks it ready for an external worker.
2. **Given** the handoff record is created, **When** the commander views the queue item, **Then** the queue detail shows handoff status, created timestamp, and worker payload summary.
3. **Given** the queued work item is player-impacting and lacks explicit approval, **When** handoff preparation is requested, **Then** the system rejects the request and creates no handoff record.

---

### User Story 2 - Inspect Worker Handoff Readiness And Failures (Priority: P2)

As a commander, I want to inspect worker handoff records and failure reasons so that I can see what is ready, blocked, or already claimed without reading raw database documents.

**Why this priority**: Automation is hands and feet, so every handoff must be inspectable. Commanders need to understand what left the queue boundary and what is still blocked before trusting workers.

**Independent Test**: Seed handoff records in ready, claimed, completed, and failed states, then verify the app and API return status, timestamps, failure reason, and linked queue item context.

**Acceptance Scenarios**:

1. **Given** handoff records exist for the active corporation scope, **When** the commander opens the automation queue, **Then** the system shows handoff status and recent handoff activity.
2. **Given** a handoff is failed or blocked, **When** the commander inspects it, **Then** the failure reason is visible without exposing secrets or raw worker credentials.
3. **Given** a handoff belongs to a different corporation scope, **When** the commander requests handoff records, **Then** that record is not returned.

---

### User Story 3 - Keep Netlify Requests Short And Non-Executing (Priority: P3)

As an operator, I want handoff preparation to stop at durable record creation so that long-running worker processing, retries, and external service calls happen outside request/response paths.

**Why this priority**: This protects the architecture boundary and prevents Netlify functions from becoming worker runners or silent automation executors.

**Independent Test**: Trigger handoff preparation and verify the request only validates inputs, writes a bounded handoff record, and never calls external workers, EVE write APIs, retry loops, or long-running processing.

**Acceptance Scenarios**:

1. **Given** handoff preparation succeeds, **When** the API response returns, **Then** it reports durable handoff metadata only and does not claim that work was executed.
2. **Given** a worker endpoint or external service is unavailable, **When** handoff preparation runs, **Then** the request still avoids external dispatch and records only local handoff readiness.
3. **Given** a caller attempts to request immediate execution, **When** handoff preparation validates the request, **Then** the system rejects or ignores execution flags.

---

### Operating Model Alignment

- **Numbers**: Handoff records can prepare future wallet, asset, logistics, and market analysis work without executing financial or in-game actions.
- **Opportunity**: Handoff payloads can prepare research or opportunity-evaluation work from approved queue items.
- **People**: Handoff records can prepare leadership follow-up or recruiting support work without changing roles, access, or player state.
- **Decision Boundary**: Handoff preparation is a draft work transfer, not an executed action.
- **Automation Boundary**: Safe automatic record creation after validation; no worker dispatch, retries, EVE writes, role/access changes, wallet/asset actions, standings changes, or external-service mutations in this feature.

### Edge Cases

- Queue item does not exist, belongs to another corporation scope, or is already archived.
- Queue item is player-impacting and does not have required approval metadata.
- Queue item is already handed off and the commander requests handoff again.
- Handoff payload would include secrets, MongoDB credentials, OAuth tokens, cookie signatures, or raw worker credentials.
- Browser attempts to override corporation scope, handoff status, worker owner, or execution flags.
- Existing handoff record is failed, blocked, claimed, or completed.
- MongoDB write succeeds but queue detail refresh is stale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a commander to prepare worker handoff for an existing queued automation record in the active corporation scope.
- **FR-002**: System MUST create a durable handoff record linked to the source queue item, corporation scope, payload summary, status, timestamps, and creator context when handoff preparation succeeds.
- **FR-003**: System MUST reject handoff preparation for missing queue items, cross-corporation queue items, archived queue items, or queue items that are not eligible for handoff.
- **FR-004**: System MUST require existing explicit approval metadata before preparing handoff for player-impacting queue items.
- **FR-005**: System MUST prevent duplicate active handoff records for the same queue item unless a prior handoff is completed, failed, or cancelled.
- **FR-006**: System MUST expose handoff status and linked handoff metadata on automation queue detail views.
- **FR-007**: System MUST expose a scoped handoff list or detail read path for ready, claimed, completed, blocked, failed, and cancelled handoff states.
- **FR-008**: System MUST ignore browser-controlled corporation scope, handoff status, worker owner, execution flags, and external dispatch targets.
- **FR-009**: System MUST NOT expose server secrets, MongoDB credentials, EVE OAuth tokens, cookie signatures, or worker credentials in handoff records or browser-visible responses.
- **FR-010**: System MUST NOT call external workers, EVE write APIs, retry loops, or long-running processors inside Netlify request/response handlers.
- **FR-011**: System MUST make handoff preparation idempotent for already-active handoff records by returning the existing active handoff rather than creating duplicates.
- **FR-012**: Handoff validation, queue eligibility, scoped reads, duplicate prevention, and browser-visible states MUST be covered by contract/unit tests and browser smoke tests.

### Key Entities *(include if feature involves data)*

- **WorkerHandoff**: Durable record that links a queue item to a worker-ready payload, status, timestamps, corporation scope, and audit metadata.
- **HandoffPayloadSummary**: Browser-safe summary of the work package prepared for a worker. It contains task intent, input summary, expected output, and source links without secrets.
- **HandoffStatus**: Lifecycle state for prepared worker handoff: ready, claimed, completed, blocked, failed, or cancelled.
- **QueueEligibilityResult**: Internal validation result explaining whether a queue item may be handed off and, if not, the safe commander-visible reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A valid approved queue item can be prepared for worker handoff and returns a durable handoff record in one request.
- **SC-002**: Duplicate handoff preparation for the same active queue item returns the existing active handoff and does not create a second active record.
- **SC-003**: Player-impacting queue items without explicit approval are rejected before any handoff record is created.
- **SC-004**: Browser smoke validation shows handoff-ready and handoff-blocked states on the automation queue surface.
- **SC-005**: No handoff API response contains secrets, tokens, credentials, cookie signatures, or external dispatch targets.
- **SC-006**: Handoff preparation validation proves no external worker dispatch, EVE write, retry loop, or long-running processing is invoked in request/response code.

## Assumptions

- Existing automation queue records remain the source of truth for task intent, approval metadata, and player-impacting boundaries.
- M7 creates handoff records and browser-visible readiness only; a future slice will implement actual worker polling, claiming, completion callbacks, retries, or external dispatch.
- MongoDB remains the durable store for queue and handoff records.
- Active corporation scope continues to come from the M6 session-first auth boundary with `EVEONLINE_CORPORATION_ID` fallback for local tests.
- Worker payloads are bounded summaries derived from existing queue records, not arbitrary browser-provided executable instructions.
