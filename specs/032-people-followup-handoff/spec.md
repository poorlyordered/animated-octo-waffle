# Feature Specification: M32 People Follow-Up Handoff

**Feature Branch**: `032-people-followup-handoff`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Proceed with M32 using the Spec Kit development process and code-review-and-quality as a quality gate. Roadmap candidate: People follow-up approval or queued-work handoff parity if the People operating layer should match the Numbers and Opportunity command loops."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record A People Follow-Up Decision (Priority: P1)

As a commander, I want to turn a leadership follow-up into a proposed decision so the People operating layer can enter the same auditable decision loop as Numbers and Opportunity.

**Why this priority**: People follow-ups currently stay as local follow-up records. Recording a proposed decision is the first durable handoff from people observations into command authority.

**Independent Test**: From an open leadership follow-up, record a proposed decision and verify the browser shows decision id, proposed status, approval required, and no queued work.

**Acceptance Scenarios**:

1. **Given** an open leadership follow-up without a linked decision, **When** the commander records a decision, **Then** the system creates a proposed decision linked to the member and follow-up.
2. **Given** the decision is recorded, **When** the People follow-up list refreshes, **Then** the follow-up handoff shows the decision id, proposed status, and approval required.
3. **Given** a decision already exists for that follow-up, **When** the commander records a decision again, **Then** the existing decision is surfaced instead of creating a duplicate.

---

### User Story 2 - Approve Or Reject A People Follow-Up Decision (Priority: P2)

As a commander, I want to approve or reject a People-origin proposed decision so player-impacting leadership work stays under explicit command authority.

**Why this priority**: Approval is the gateway between a proposed People recommendation and queued work. Rejection keeps stale or unsafe follow-ups auditable without creating work.

**Independent Test**: Approve one People-origin proposed decision and reject another, then verify the browser shows queue-ready for approved and queue-blocked for rejected without creating queued work.

**Acceptance Scenarios**:

1. **Given** a proposed People-origin decision, **When** the commander approves it with approval text, **Then** the decision status becomes approved and queue readiness is visible.
2. **Given** a proposed People-origin decision, **When** the commander rejects it with a note, **Then** the decision status becomes rejected and queued work remains blocked.
3. **Given** approval or rejection succeeds, **When** the response is returned, **Then** no worker handoff, EVE write, role change, or external execution occurs.

---

### User Story 3 - Create Queued Work From Approved People Decisions (Priority: P3)

As a commander, I want to create queued planning work from an approved People follow-up decision so leadership work can be prepared for workers without being executed.

**Why this priority**: Queue creation completes parity with the Numbers and Opportunity command loops while preserving the separate approval and automation boundaries.

**Independent Test**: After approving a People-origin decision, create queued work and verify the follow-up handoff shows queue item id/status while no worker dispatch or role mutation occurs.

**Acceptance Scenarios**:

1. **Given** an approved People-origin decision, **When** the commander creates queued work, **Then** a queue item is created and linked to the follow-up and decision.
2. **Given** a proposed or rejected People-origin decision, **When** queue creation is attempted, **Then** the system refuses it and keeps queue linkage empty.
3. **Given** queued work already exists for the follow-up, **When** queue creation is requested again, **Then** the existing queue linkage is surfaced instead of creating a duplicate.

### Operating Model Alignment

- **Numbers**: Not changed directly; this slice mirrors established Numbers decision approval and queue separation.
- **Opportunity**: Not changed directly; this slice mirrors the Opportunity approval and queued-work handoff loop.
- **People**: Primary domain. Leadership follow-ups become decision-linked, approval-gated, and queue-ready command artifacts.
- **Decision Boundary**: Follow-ups remain recommendations until recorded as proposed decisions; approval and rejection are explicit commander actions.
- **Automation Boundary**: Queue creation prepares work only. It does not dispatch workers, prepare handoffs, execute retries, mutate EVE roles/access, or call external services.

### Edge Cases

- Follow-up is missing, belongs to another corporation scope, or already has a linked decision.
- Linked member profile has stale or missing people coverage.
- Player-impacting decision approval lacks explicit approval text.
- Browser supplies forged decision, queue, approval, dispatch, retry, role, access, EVE write, or external execution fields.
- Queue creation is requested before approval, after rejection, or after a queue item already exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a commander to record a proposed decision from an eligible People leadership follow-up.
- **FR-002**: Decision creation MUST link the decision to the People follow-up, member profile, people operating leg, and source coverage without trusting browser-provided provenance.
- **FR-003**: Repeated decision creation for the same follow-up MUST surface the existing linked decision instead of creating duplicates.
- **FR-004**: System MUST allow a commander to approve or reject a People-origin proposed decision.
- **FR-005**: Approval requests for player-impacting People decisions MUST require explicit approval text.
- **FR-006**: Status action responses MUST show approval-required, queue-ready, queue-blocked, and linked-queue states in browser-safe handoff metadata.
- **FR-007**: System MUST allow queued work creation only from approved People-origin decisions and MUST keep queue creation separate from approval.
- **FR-008**: Repeated queue creation for the same approved People follow-up MUST surface existing queue linkage instead of creating duplicate queue items.
- **FR-009**: Browser UI MUST render record-decision, approve, reject, and create-queue controls only when the current handoff state allows them.
- **FR-010**: System MUST reject browser-controlled approval metadata, decision status, queue status, provenance, dispatch, retry, role/access mutation, EVE write, and external execution fields.
- **FR-011**: System MUST NOT dispatch workers, prepare worker handoffs, claim work, schedule retries, run retries, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or execute external services during this slice.
- **FR-012**: Contract/unit and browser smoke tests MUST cover decision creation, duplicate handling, approval, rejection, queue creation, queue blocking, unsafe-field rejection, and no-execution language.

### Key Entities *(include if feature involves data)*

- **LeadershipFollowUp**: Existing People follow-up record that can link to a decision and queue item.
- **PeopleFollowUpHandoff**: Browser-safe state summary for decision, approval, queue readiness, and boundary copy.
- **DecisionRecord**: Existing command decision artifact created from and linked to a People follow-up.
- **AutomationQueueItem**: Existing queued-work artifact created only after explicit approval.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can record a proposed decision from a People follow-up and see the handoff update without leaving the People surface.
- **SC-002**: A People-origin proposed decision can be approved or rejected, with queue readiness reflecting the resulting status.
- **SC-003**: Queued work can be created only after approval and remains linked to the People follow-up and decision.
- **SC-004**: Duplicate decision and queue attempts return existing linkage rather than creating additional artifacts.
- **SC-005**: Tests prove unsafe execution-like browser fields are rejected and no worker, EVE, role/access, retry, or external execution behavior is triggered.

## Assumptions

- Existing decision-record and automation-queue stores remain the durable persistence paths.
- People follow-up handoff metadata is derived server-side from follow-up, decision, and queue records.
- The slice is browser/request-path only and does not introduce worker execution or live EVE role/access writes.
