# Feature Specification: Decision List Pagination and Persisted Filters

**Feature Branch**: `028-decision-list-pagination-persistence`
**Created**: 2026-06-04
**Status**: Draft

## User Stories

### Story 1 - Page through a crowded decision list

As a commander reviewing mixed Numbers and Opportunity decisions, I need the decision list to show a bounded page at a time so the list remains scannable as records grow.

### Story 2 - Keep browser-local filters across reloads

As a commander returning to the decision loop, I need my selected status/source/page-size filters to persist locally so I can continue the same review context without server-side saved preferences.

### Story 3 - Preserve read-only list boundaries

As a commander, I need pagination and persisted filters to organize the list only, without approving decisions, creating queued work, dispatching workers, retrying work, fetching ESI, writing to EVE, or executing external services.

## Functional Requirements

- FR-001: Decision list filters MUST persist browser-locally for status, source, and page size.
- FR-002: Invalid persisted filter values MUST fall back to safe defaults.
- FR-003: Filter changes MUST reset the visible page to page 1.
- FR-004: The decision list MUST show only the current page of filtered decisions.
- FR-005: Pagination controls MUST expose current page, total pages, and result range.
- FR-006: Previous/next controls MUST disable at the first and last page.
- FR-007: Page size options MUST remain bounded and browser-local.
- FR-008: Pagination/filter persistence MUST NOT add backend filtering, durable preference storage, approval mutation, queue creation, worker dispatch, retry, ESI fetch, EVE write, or external-service execution.

## Success Criteria

- SC-001: Unit coverage proves filters persist and invalid stored values are ignored.
- SC-002: Unit coverage proves pagination page windows and clamped pages.
- SC-003: Browser smoke coverage proves a user can change page size, move pages, filter, and reload while retaining filter/page-size state.
- SC-004: Existing decision filter behavior remains intact.

## Out Of Scope

- Backend pagination or filtering.
- Durable user preference storage.
- Saved named views.
- Approval mutation, queue creation, worker dispatch, retry, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.
