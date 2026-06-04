# Feature Specification: Retry Rescheduling Controls

**Feature Branch**: `026-retry-rescheduling-controls`
**Created**: 2026-06-04
**Status**: Draft

## User Stories

### Story 1 - Reschedule a pending worker handoff retry

As a commander reviewing a failed worker handoff with a scheduled retry, I need to move that retry to a later safe time without canceling and recreating the audit record.

### Story 2 - Reschedule a pending Numbers ESI sync retry

As a commander reviewing a failed Numbers ESI sync request with a scheduled retry, I need to defer the retry when prerequisites or timing make immediate retry work undesirable.

### Story 3 - Preserve explicit execution boundaries

As a commander, I need rescheduling to update only retry timing and rationale so the browser never dispatches workers, claims retry work, executes retries, fetches ESI, writes to EVE, or mutates external systems.

## Functional Requirements

- FR-001: Retry policy summaries MUST expose whether the current retry can be rescheduled.
- FR-002: Only retries in `scheduled` status MUST be reschedulable.
- FR-003: Rescheduling MUST update the scheduled retry reason, optional not-before time, and update timestamp.
- FR-004: Rescheduling MUST preserve the same retry id and target.
- FR-005: Worker handoff retry rescheduling MUST verify the handoff belongs to the scoped corporation.
- FR-006: ESI sync retry rescheduling MUST verify the sync request belongs to the scoped corporation.
- FR-007: Browser controls MUST surface reschedule eligibility and boundary language near existing schedule/cancel controls.
- FR-008: Reschedule requests MUST reject unsafe secret, dispatch, execution, EVE write, wallet, asset, contract, role, and external mutation fields.

## Success Criteria

- SC-001: A scheduled worker handoff retry can be rescheduled and remains browser-visible as scheduled with updated not-before metadata.
- SC-002: A scheduled Numbers ESI sync retry can be rescheduled and remains browser-visible as scheduled with updated not-before metadata.
- SC-003: Blocked, claimed, completed, and canceled retries cannot be rescheduled.
- SC-004: Local validation covers contracts, store behavior, browser workflows, and production build.

## Out Of Scope

- Editing retry policy limits.
- Rescheduling blocked, claimed, completed, or canceled retries.
- Worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.
