# Feature Specification: M33 People Worker Handoff

**Feature Branch**: `033-people-worker-handoff`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Proceed feature by feature from the roadmap. M33 selected from roadmap recommendation: People worker handoff preparation from approved queued work if the People operating layer should continue matching the Opportunity command loop."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prepare A People Worker Handoff (Priority: P1)

As a commander, I want to prepare a worker handoff from approved People queued work so leadership follow-up work can be made worker-ready without leaving the People surface.

**Why this priority**: M32 created approved People queued work. The next parity gap is the explicit worker handoff preparation step already available to Opportunity queued work.

**Independent Test**: Record, approve, and queue a People follow-up, then prepare a worker handoff and verify the People surface shows handoff id/status and non-execution boundary language.

**Acceptance Scenarios**:

1. **Given** a People follow-up has approved queued work, **When** the commander prepares a worker handoff, **Then** the browser shows worker handoff id and status.
2. **Given** worker handoff preparation succeeds, **When** the response is shown, **Then** it states that no worker was dispatched, claimed, retried, or executed.
3. **Given** no queued work exists, **When** the People follow-up is displayed, **Then** no worker handoff preparation control is shown.

### Operating Model Alignment

- **Numbers**: Not changed.
- **Opportunity**: Existing worker handoff preparation pattern is reused.
- **People**: Primary domain. People leadership queued work becomes handoff-ready.
- **Decision Boundary**: Existing People decision and queue approval gates remain unchanged.
- **Automation Boundary**: Handoff preparation creates a durable handoff record only; no dispatch, claim, retry, execution, EVE role/access mutation, or external service call.

### Edge Cases

- Queued work is not linked to the follow-up.
- A handoff already exists for the queue item.
- Handoff preparation fails because the queue item is not eligible.
- Browser attempts to provide worker dispatch, claim, retry, execution, role/access, EVE write, or external-service fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Browser UI MUST render People queued-work detail after queued work is linked.
- **FR-002**: Browser UI MUST show a Prepare worker handoff control only for People queued work without a displayed handoff.
- **FR-003**: Handoff preparation MUST reuse the existing automation queue worker handoff API.
- **FR-004**: Browser UI MUST show handoff id, status, and created timestamp after preparation.
- **FR-005**: Browser UI MUST clearly state that handoff preparation does not dispatch, claim, retry, execute, mutate EVE roles/access, or call external services.
- **FR-006**: Tests MUST cover People worker handoff preparation and no-execution boundary language.

### Key Entities *(include if feature involves data)*

- **PeopleFollowUpHandoff**: Existing browser-safe People follow-up state with queue linkage.
- **WorkerHandoff**: Existing durable worker-ready handoff record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can prepare a worker handoff from People queued work in the People surface.
- **SC-002**: The People surface displays the prepared handoff id/status immediately after preparation.
- **SC-003**: Browser smoke coverage verifies no-execution boundary language for People worker handoff preparation.

## Assumptions

- M33 does not add People-specific backend handoff routes.
- Existing automation queue handoff eligibility remains the server-side authority.
- Retry controls for People worker handoffs are a later slice.
