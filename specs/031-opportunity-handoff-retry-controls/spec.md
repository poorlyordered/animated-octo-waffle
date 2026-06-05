# Feature Specification: M31 Opportunity Handoff Retry Controls

**Feature Branch**: `031-opportunity-handoff-retry-controls`
**Created**: 2026-06-05
**Status**: Draft
**Input**: User description: "Proceed with the next recommended feature after M30 review: Opportunity worker handoff retry controls once Opportunity handoff preparation has been reviewed."

## User Stories & Testing

### User Story 1 - Schedule Failed Opportunity Handoff Retry (Priority: P1)

As a commander reviewing a failed Opportunity worker handoff, I need to schedule a retry from the Opportunity surface so I can keep the Opportunity workflow in context without dispatching or executing work.

**Independent Test**: After an Opportunity queued work detail surfaces a failed handoff, schedule a handoff retry and verify the retry remains a scheduled record with no worker dispatch.

### User Story 2 - Manage Scheduled Opportunity Handoff Retry (Priority: P1)

As a commander, I need to cancel, reschedule, and apply bounded policy delays to scheduled Opportunity handoff retries so retry timing stays explicit and auditable.

**Independent Test**: Schedule a retry from the Opportunity surface, reschedule it, apply a delay policy, and cancel it while verifying the browser shows no-execution boundary language.

## Requirements

- **FR-001**: The Opportunity queued-work detail MUST show failed worker handoff failure details when present.
- **FR-002**: The Opportunity surface MUST expose Schedule handoff retry only for failed handoffs.
- **FR-003**: The Opportunity surface MUST expose cancel, reschedule, and delay policy controls only when retry policy metadata allows them.
- **FR-004**: All retry actions MUST reuse the existing worker handoff retry APIs.
- **FR-005**: Retry actions MUST update browser-visible retry status without preparing, dispatching, claiming, or executing worker work.
- **FR-006**: Browser copy MUST state that retry history and policy controls do not dispatch, claim, execute, or call external services.

## Success Criteria

- **SC-001**: Browser workflow can schedule, reschedule, apply a delay policy, and cancel an Opportunity handoff retry.
- **SC-002**: Unit coverage verifies failed Opportunity handoff retry metadata remains browser-safe.
- **SC-003**: Existing retry contracts remain unchanged and are reused.

## Out of Scope

- Worker dispatch, claim, execution, or retry worker processing.
- New Opportunity-specific retry routes.
- ESI fetches, EVE writes, wallet/asset/contract/role mutations, or external-service execution.
- Retry controls for People surfaces.
