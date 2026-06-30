# Feature Specification: M35 Decision Backend Filtering

**Feature Branch**: `035-decision-backend-filtering`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Filter decisions through the API (Priority: P1)

As a commander reviewing a growing decision archive, I want status and source filters to be applied by the decision-record API so the browser does not need to load every record before I can review a focused list.

**Independent Test**: Selecting status or source filters in the Decision Records surface reloads `/api/decision-records` with bounded query parameters and displays only matching records.

### User Story 2 - Preserve local review ergonomics (Priority: P2)

As a commander, I want page size and filter persistence to continue working while backend filtering is added.

**Independent Test**: Existing pagination and persisted filter smoke coverage continues to pass with filtered API responses.

## Requirements

- **FR-001**: `GET /api/decision-records` MUST accept optional bounded `status` and `source` query filters.
- **FR-002**: `source` MUST be limited to `opportunity`, `numbers`, or `people`.
- **FR-003**: Opportunity filtering MUST include legacy brief decisions without `sourceContext`.
- **FR-004**: Browser filter changes MUST request filtered decision records from the API.
- **FR-005**: Page size and pagination MUST remain browser-local and bounded.
- **FR-006**: Filtering MUST NOT approve decisions, create queued work, dispatch workers, schedule retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

## Success Criteria

- **SC-001**: Unit tests cover server filter mapping and Mongo query construction.
- **SC-002**: Browser smoke validates filtered Decision Records behavior against filtered API fixtures.
- **SC-003**: Existing local validation passes: targeted tests, browser smoke, typecheck, lint, full tests, and build.

