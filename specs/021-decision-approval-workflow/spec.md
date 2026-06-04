# Feature Specification: Decision Approval Workflow Improvements

**Feature Branch**: `021-decision-approval-workflow`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M21: Decision Approval Workflow Improvements. Scope it around approving/rejecting Numbers-origin proposed decisions, preserving explicit approval boundaries, surfacing approval status clearly, and keeping queue creation separate from approval unless already modeled as a deliberate commander action."

## User Scenarios & Testing

### User Story 1 - Approve A Numbers-Origin Decision (Priority: P1)

As a commander, I want to explicitly approve a proposed Numbers-origin decision so that the record becomes queue-ready without automatically creating queued work.

**Why this priority**: M17 surfaced the approval handoff, but approval still required leaving the Numbers workflow. Approval is the missing gateway between a recorded Numbers follow-up decision and separately queued work.

**Independent Test**: Record a Numbers follow-up decision, approve it with explicit approval text, and verify the response and browser show approved status, queue-ready state, and no queue creation.

**Acceptance Scenarios**:

1. **Given** a proposed Numbers-origin decision, **When** the commander approves it with approval text, **Then** the decision status becomes approved and approval metadata is stored.
2. **Given** the approval succeeds, **When** the browser displays the handoff, **Then** it says the decision is approved and ready for separately queued work.
3. **Given** the approval succeeds, **When** the response is returned, **Then** no automation queue item is created and no worker or EVE action is dispatched.

---

### User Story 2 - Reject A Numbers-Origin Decision (Priority: P2)

As a commander, I want to reject a proposed Numbers-origin decision with a note so that the recommendation is closed without creating queued work.

**Why this priority**: Rejection is the other explicit commander decision at the approval gateway and keeps stale or unwanted recommendations auditable.

**Independent Test**: Record a Numbers follow-up decision, reject it with a note, and verify the response and browser show rejected status, queue blocked state, and no execution.

**Acceptance Scenarios**:

1. **Given** a proposed Numbers-origin decision, **When** the commander rejects it, **Then** the decision status becomes rejected and the note is stored in status history.
2. **Given** a rejected decision, **When** the browser displays the handoff, **Then** queued work remains blocked and the rejection state is clear.
3. **Given** a rejected decision, **When** the commander attempts queue creation, **Then** existing queue eligibility rules continue to refuse it.

---

### User Story 3 - Protect Approval Boundaries (Priority: P3)

As a commander, I want approval controls to be scoped to the correct Numbers candidate and to reject execution-like inputs so that approval cannot be forged into queueing or execution.

**Why this priority**: Approval is player-impacting authority. The server must derive origin and handoff state from stored records, not browser-provided overrides.

**Independent Test**: Submit mismatched decision ids, non-Numbers decisions, missing approval text for player-impacting approval, and execution-like fields; verify each is rejected without mutation.

**Acceptance Scenarios**:

1. **Given** a status request references a decision from another candidate, **When** it is handled, **Then** the request is refused.
2. **Given** a player-impacting decision approval lacks approval text, **When** it is handled, **Then** the request is refused.
3. **Given** a browser request includes queue, dispatch, retry, EVE write, wallet, asset, contract, role, or external execution fields, **When** it is handled, **Then** the unsafe field is rejected.

### Operating Model Alignment

- **Numbers**: Primary source. M21 improves the decision approval gateway for Numbers follow-up recommendations.
- **Opportunity**: Not ingested or changed in this slice.
- **People**: Not mutated; player-impacting people implications still require explicit approval text.
- **Decision Boundary**: Approve and reject mutate only the decision record status and history.
- **Automation Boundary**: Approval does not create queued work. Queue creation remains a separate commander action and still performs no worker dispatch or execution.

### Edge Cases

- Follow-up candidate no longer exists in the latest snapshot.
- Decision does not exist, belongs to another corporation, or does not match the candidate origin.
- Decision is already approved or rejected.
- Player-impacting approval lacks explicit approval text.
- Browser supplies approval metadata, queue linkage, dispatch, retry, EVE write, wallet, asset, contract, role, or external execution fields.

## Requirements

### Functional Requirements

- **FR-001**: System MUST expose a Numbers-origin decision status action for approving or rejecting a decision tied to a specific follow-up candidate and snapshot.
- **FR-002**: Approval requests MUST require explicit approval text when the decision is player-impacting.
- **FR-003**: Rejection requests MUST preserve a rejection note in decision status history when provided.
- **FR-004**: Status action responses MUST include the updated decision, Numbers follow-up origin, and browser-safe approval handoff metadata.
- **FR-005**: Status action responses MUST clearly distinguish approved queue-ready, rejected queue-blocked, and proposed approval-required states.
- **FR-006**: System MUST verify the decision source context matches the requested Numbers follow-up candidate and snapshot.
- **FR-007**: Browser UI MUST render approve and reject controls for recorded proposed Numbers decisions.
- **FR-008**: Browser UI MUST keep queue creation separate from approval and show queue creation only after approved status.
- **FR-009**: System MUST reject browser-controlled approval metadata, queue handoff metadata, queue status, provenance, dispatch, retry, EVE write, wallet, asset, contract, role, and external execution fields.
- **FR-010**: System MUST NOT create queued work, dispatch workers, claim handoffs, schedule retries, run retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services during approval or rejection.
- **FR-011**: Contract/unit and browser smoke tests MUST cover approval, rejection, queue separation, origin mismatch, unsafe field rejection, and no-execution language.

### Key Entities

- **DecisionRecord**: Existing command decision artifact whose status and approval metadata are updated.
- **NumbersApprovalHandoff**: Browser-safe state summary recomputed after approval or rejection.
- **NumbersFollowUpOrigin**: Server-derived link between snapshot, candidate, and decision.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A proposed Numbers-origin decision can be approved with explicit text and becomes queue-ready without creating queued work.
- **SC-002**: A proposed Numbers-origin decision can be rejected and remains queue-blocked.
- **SC-003**: Browser-visible handoff metadata updates after approval and rejection.
- **SC-004**: Queue creation remains a separate commander action after approval.
- **SC-005**: Unsafe approval or execution-like browser fields are rejected by tests.
- **SC-006**: Existing lint, typecheck, unit/contract tests, browser smoke tests, and production build continue to pass.

## Assumptions

- M21 does not add a new durable collection.
- The generic decision-record status endpoint remains available for non-Numbers workflows.
- Queue creation remains governed by existing automation queue eligibility rules.
