# Feature Specification: M36 Cross-Surface Retry Audit Filtering

**Feature Branch**: `036-cross-surface-retry-audit-filtering`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Filter retry audit histories by status (Priority: P1)

As a commander reviewing failed automation and sync recovery, I want retry history sections to filter by retry status so scheduled, blocked, completed, and canceled attempts stay scannable.

**Independent Test**: Worker handoff and ESI sync browser smoke tests select retry history statuses and show matching attempts, counts, and empty states.

### User Story 2 - Keep retry audit behavior consistent across surfaces (Priority: P2)

As a commander moving between Opportunity, People, Automation Queue, and ESI sync surfaces, I want retry history filters to behave the same way and retain no-execution boundaries.

**Independent Test**: Shared unit coverage proves filtering and summary formatting; existing browser smoke proves surfaces still render retry histories and boundary language.

## Requirements

- **FR-001**: Retry history sections MUST expose a bounded status filter for all retry request statuses plus an all-status option.
- **FR-002**: Filtering MUST be browser-local and read-only.
- **FR-003**: Retry attempt summaries MUST preserve claim, completion, cancellation, replacement, blocked reason, and policy boundary details.
- **FR-004**: Empty filtered retry histories MUST keep controls visible and show an explicit empty state.
- **FR-005**: Automation Queue, Opportunity, People, and ESI sync retry histories MUST share the same filtering behavior.
- **FR-006**: Filtering MUST NOT schedule, cancel, reschedule, claim, dispatch, execute, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

## Success Criteria

- **SC-001**: Unit tests cover retry audit filtering and summary preservation.
- **SC-002**: Browser smoke covers non-empty and empty filtered retry history states.
- **SC-003**: Existing local validation passes: targeted tests, browser smoke, typecheck, lint, full tests, and build.

