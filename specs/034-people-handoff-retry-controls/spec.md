# Feature Specification: M34 People Handoff Retry Controls

**Feature Branch**: `034-people-handoff-retry-controls`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Proceed feature by feature from the roadmap. M34 selected from roadmap recommendation: People handoff retry controls if the People operating layer should continue matching Opportunity failed-handoff recovery."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schedule A Failed People Handoff Retry (Priority: P1)

As a commander, I want to schedule retry intent for a failed People worker handoff so leadership work can be recovered without executing it immediately.

**Why this priority**: M33 prepared worker handoffs from People queued work. Failed handoffs now need the same commander-controlled recovery path Opportunity has.

**Independent Test**: Prepare or view a failed People handoff, schedule a retry, and verify retry status/history plus no-execution boundary language.

**Acceptance Scenarios**:

1. **Given** a People queued-work handoff is failed, **When** the commander schedules a retry, **Then** the retry status is shown as scheduled.
2. **Given** retry scheduling succeeds, **When** the browser updates, **Then** it states that no worker was dispatched, claimed, retried, executed, or external action performed.

### User Story 2 - Manage Scheduled People Handoff Retry Timing (Priority: P2)

As a commander, I want to cancel, reschedule, or apply bounded retry delay policy to a scheduled People handoff retry.

**Why this priority**: Retry recovery is not complete unless the commander can defer or cancel scheduled retry intent.

**Independent Test**: Schedule a People handoff retry, reschedule it, apply a delay policy, cancel it, and verify each action updates browser-visible retry state without execution.

**Acceptance Scenarios**:

1. **Given** a scheduled People handoff retry, **When** the commander reschedules it, **Then** the updated not-before/policy reason appears.
2. **Given** a scheduled People handoff retry, **When** the commander cancels it, **Then** the retry status changes to canceled and no execution occurs.

### Operating Model Alignment

- **Numbers**: Not changed.
- **Opportunity**: Existing failed handoff retry controls are reused as the parity pattern.
- **People**: Primary domain. Leadership queued-work handoff failures become recoverable through commander-controlled retry intent.
- **Decision Boundary**: Retry controls operate after approved decision, queue creation, and handoff preparation.
- **Automation Boundary**: Retry controls mutate retry records only. They do not dispatch, claim, execute, mutate EVE roles/access, or call external services.

### Edge Cases

- Handoff is not failed.
- Retry already exists for the handoff.
- Retry policy disallows cancel or reschedule.
- Browser attempts to provide dispatch, claim, execution, EVE role/access, or external-service fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Browser UI MUST show failed People worker handoff state on People queued-work detail.
- **FR-002**: Browser UI MUST allow scheduling retry intent for failed People worker handoffs using existing worker handoff retry APIs.
- **FR-003**: Browser UI MUST allow canceling and rescheduling scheduled People handoff retries only when server-owned policy metadata permits it.
- **FR-004**: Browser UI MUST render server-owned retry delay policy options when rescheduling is allowed.
- **FR-005**: Browser UI MUST show retry history for People worker handoffs when present.
- **FR-006**: Browser UI MUST state retry controls do not dispatch, claim, execute, mutate EVE roles/access, or call external services.
- **FR-007**: Tests MUST cover schedule, reschedule, policy delay, cancel, retry history, and no-execution language.

### Key Entities *(include if feature involves data)*

- **WorkerHandoffSummary**: Existing browser-safe failed handoff and retry metadata.
- **RetryRequestSummary**: Existing browser-safe retry status, policy, and history metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can schedule retry intent from a failed People handoff in the People surface.
- **SC-002**: A commander can reschedule, apply retry delay policy, and cancel scheduled People handoff retry intent.
- **SC-003**: Browser smoke coverage proves retry controls update metadata only and do not execute work.

## Assumptions

- Existing worker handoff retry APIs remain the server-side authority.
- M34 does not introduce People-specific retry routes.
- Actual retry execution remains worker-only and outside browser/request paths.
