# Feature Specification: Retry Cancellation and Policy Controls

**Feature Branch**: `020-retry-cancellation-policy`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M20: Retry cancellation and retry policy controls for scheduled or blocked retry requests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancel Scheduled or Blocked Retries (Priority: P1)

As a commander, I want to cancel scheduled or blocked retry records so that stale retry intent can be explicitly closed without dispatching workers or executing work.

**Why this priority**: M15/M16 added scheduling and worker execution, but retry records can remain scheduled or blocked after circumstances change.

**Independent Test**: Schedule or surface a retry, cancel it from the browser/API, and verify the retry becomes canceled with commander reason and no-execution boundary language.

**Acceptance Scenarios**:

1. **Given** a scheduled handoff retry exists, **When** the commander cancels it, **Then** the retry status becomes canceled.
2. **Given** a blocked ESI sync retry exists, **When** the commander cancels it, **Then** the retry status becomes canceled while preserving safe blocked/cancel metadata.
3. **Given** a claimed or completed retry exists, **When** cancellation is requested, **Then** the request is refused.

---

### User Story 2 - Surface Retry Policy Controls (Priority: P2)

As a commander, I want retry summaries to show scheduling and cancellation policy so that I know when a retry can be scheduled, canceled, or left to worker-only execution.

**Why this priority**: Retry safety depends on visible limits: one active scheduled retry per target, scheduled/blocked retries can be canceled, claimed/completed retries cannot.

**Independent Test**: Parse retry summaries and verify policy metadata includes active scheduled limit, cancelable statuses, can-cancel state, and boundary text.

**Acceptance Scenarios**:

1. **Given** a scheduled retry is displayed, **When** the commander inspects it, **Then** policy says it can be canceled and only one active scheduled retry is allowed per target.
2. **Given** a completed retry is displayed, **When** the commander inspects it, **Then** policy says it cannot be canceled.
3. **Given** retry history is browser-visible, **When** it is serialized, **Then** policy metadata includes no execution handles.

---

### User Story 3 - Preserve No-Execution Boundaries (Priority: P3)

As a commander, I want retry cancellation to remain a record update only so that the browser never dispatches workers, claims retry work, executes retries, fetches ESI, writes to EVE, or mutates external systems.

**Why this priority**: Retry controls are adjacent to worker execution. Cancellation must stay in the command-record layer.

**Independent Test**: Submit cancellation and unsafe retry fields and verify cancellation responses are browser-safe and unsafe execution fields are rejected.

**Acceptance Scenarios**:

1. **Given** cancellation succeeds, **When** the browser displays it, **Then** it says no worker was dispatched and no execution occurred.
2. **Given** cancellation request includes unsafe execution-like fields, **When** the server parses it, **Then** the unsafe field is rejected.
3. **Given** cancellation is unavailable, **When** the browser renders retry controls, **Then** cancel controls are disabled or absent.

### Operating Model Alignment

- **Numbers**: Retry controls apply to failed Numbers ESI sync requests.
- **Opportunity**: N/A for this slice.
- **People**: N/A for this slice.
- **Decision Boundary**: Cancellation is a command-record update, not execution.
- **Automation Boundary**: Manual cancellation only. No worker dispatch, claim, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution occurs.

### Edge Cases

- Retry target no longer exists.
- No scheduled or blocked retry exists for the target.
- Retry is already claimed, completed, or canceled.
- Multiple historical retries exist for the same target.
- Browser attempts to send dispatch, token, EVE write, or external mutation fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support cancellation of latest scheduled or blocked retry records for worker handoff targets.
- **FR-002**: System MUST support cancellation of latest scheduled or blocked retry records for ESI sync request targets.
- **FR-003**: Cancellation MUST set retry status, canceled timestamp, canceling actor, and cancel reason.
- **FR-004**: Cancellation MUST refuse claimed, completed, or already canceled retry records.
- **FR-005**: Retry summaries MUST include browser-safe retry policy metadata.
- **FR-006**: Retry policy metadata MUST include can-schedule, can-cancel, active scheduled limit, cancelable statuses, and boundary text.
- **FR-007**: Browser UI MUST show retry policy text and cancel controls for cancelable retry records.
- **FR-008**: API and browser responses MUST NOT include tokens, secrets, worker credentials, dispatch targets, EVE write handles, wallet/asset/contract/role mutation handles, or execution handles.
- **FR-009**: This slice MUST NOT dispatch workers, claim retry work, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.
- **FR-010**: Contract, unit, and browser smoke tests MUST cover cancellation responses, policy metadata, disabled/non-cancelable states, and no-execution language.

### Key Entities *(include if feature involves data)*

- **RetryRequestSummary**: Browser-safe retry state, policy, result, and cancellation metadata.
- **RetryPolicySummary**: Browser-safe policy statement describing scheduling and cancellation limits.
- **CancelRetryRequest**: Commander-provided reason for canceling a scheduled or blocked retry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Scheduled retry cancellation produces a canceled retry summary.
- **SC-002**: Blocked retry cancellation produces a canceled retry summary.
- **SC-003**: Claimed/completed/already canceled retries cannot be canceled.
- **SC-004**: Browser smoke tests verify retry policy text and cancellation no-execution language.
- **SC-005**: Existing lint, typecheck, unit/contract tests, browser smoke tests, and production build continue to pass.

## Assumptions

- One active scheduled retry per target remains the policy.
- Cancellation is commander-owned and defaults to actor `commander`.
- M20 does not add retry rescheduling, retry execution changes, or worker dispatch controls.
