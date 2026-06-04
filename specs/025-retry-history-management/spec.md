# Feature Specification: Retry History Management

**Feature Branch**: `025-retry-history-management`
**Created**: 2026-06-04
**Status**: Draft

## User Stories

### Story 1 - Inspect retry attempts for failed worker handoffs

As a commander reviewing a failed automation handoff, I need to see the latest retry and recent prior retry attempts so I can understand whether retries were scheduled, canceled, blocked, or completed before deciding what to do next.

### Story 2 - Inspect retry attempts for failed ESI sync requests

As a commander reviewing Numbers ESI sync history, I need retry attempts displayed with the related sync request so failed data refreshes remain auditable without opening worker tooling.

### Story 3 - Preserve approval and execution boundaries

As a commander, I need retry history to be read-only so history visibility never dispatches workers, executes retries, fetches ESI, writes to EVE, or schedules replacement work by itself.

## Functional Requirements

- FR-001: Worker handoff detail responses MUST include a bounded recent retry history for the handoff target when retry attempts exist.
- FR-002: Automation queue detail handoff summaries MUST include the same bounded recent retry history.
- FR-003: ESI sync status history items MUST include a bounded recent retry history for each sync request when retry attempts exist.
- FR-004: Existing `retry` latest-attempt fields MUST remain available for backward-compatible UI behavior.
- FR-005: Retry history MUST expose only `RetryRequestSummary` data already approved for browser use.
- FR-006: Retry history rendering MUST show status, reason, cancellation, block, completion, replacement, and policy boundary details when present.
- FR-007: Retry history MUST be clearly labeled as read-only and MUST NOT introduce retry rescheduling, worker dispatch, ESI fetch, EVE write, wallet, asset, contract, role, or external-service mutation paths.

## Success Criteria

- SC-001: Browser workflow shows more than one retry attempt for a worker handoff when fixture data contains history.
- SC-002: Browser workflow shows more than one retry attempt for an ESI sync request when fixture data contains history.
- SC-003: Contract tests accept retry history arrays and reject unsafe secret or dispatch fields through existing schemas.
- SC-004: Store tests prove history is scoped to corporation, target type, target id, and a bounded limit.

## Out Of Scope

- Retry rescheduling controls.
- Retry policy editing.
- New durable retry collection.
- Queue creation, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.
