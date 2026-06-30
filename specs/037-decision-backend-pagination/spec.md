# Feature Specification: M37 Decision Backend Pagination

**Feature Branch**: `037-decision-backend-pagination`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Page decision records through the API (Priority: P1)

As a commander reviewing a growing decision archive, I want Decision Records pagination to be applied by the API so filtered result sets do not require loading every matching record into the browser.

**Independent Test**: Decision Records browser smoke changes page size and page number while the API fixture returns only the requested page plus pagination metadata.

### User Story 2 - Preserve bounded local controls (Priority: P2)

As a commander, I want the existing bounded page-size selector, persisted filters, and no-execution boundary copy to continue working while pages come from the backend.

**Independent Test**: Unit and browser smoke coverage proves page sizes stay bounded and pagination metadata controls the rendered page summary.

## Requirements

- **FR-001**: `GET /api/decision-records` MUST accept optional `page` and bounded `pageSize` query parameters.
- **FR-002**: The API response MUST include pagination metadata: page, pageSize, totalItems, totalPages, startIndex, and endIndex.
- **FR-003**: The store MUST count filtered records and return only the requested page.
- **FR-004**: Requested pages beyond the result set MUST clamp to the last available page.
- **FR-005**: Empty result sets MUST return page 1 of 1 with start/end index 0.
- **FR-006**: Browser pagination controls MUST use server metadata and request page changes from the API.
- **FR-007**: Pagination MUST NOT approve decisions, create queued work, dispatch workers, retry, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

## Success Criteria

- **SC-001**: Contract/unit tests cover paginated response shape and pagination metadata.
- **SC-002**: Browser smoke covers server-backed page-size and next/previous navigation.
- **SC-003**: Existing local validation passes: targeted tests, browser smoke, typecheck, lint, full tests, and build.

