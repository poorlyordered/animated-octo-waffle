# Feature Specification: M38 Decision Saved Views

**Feature Branch**: `038-decision-saved-views`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Save reusable decision review views (Priority: P1)

As a commander reviewing repeated decision queues, I want to save the current status/source/page-size view so I can return to an operational review context quickly.

**Independent Test**: Browser smoke saves a rejected-decision view, changes filters, reapplies the saved view, and sees the saved status/source restored.

### User Story 2 - Manage saved views locally (Priority: P2)

As a commander, I want saved views to remain browser-local and removable so they do not create new server preference state.

**Independent Test**: Unit coverage proves saved views parse, persist, de-duplicate, and safely recover from malformed local storage.

## Requirements

- **FR-001**: The Decision Records filter bar MUST provide saved-view selection, save, and delete controls.
- **FR-002**: A saved view MUST preserve status filter, source filter, and page size.
- **FR-003**: Applying a saved view MUST reset pagination to page 1 and request the saved server filters.
- **FR-004**: Saving the same view twice MUST not create duplicates.
- **FR-005**: Saved views MUST be stored in browser localStorage only.
- **FR-006**: Malformed saved-view storage MUST be ignored safely.
- **FR-007**: Saved views MUST NOT approve decisions, create queued work, dispatch workers, retry, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

## Success Criteria

- **SC-001**: Unit tests cover saved-view parse/read/write/save behavior.
- **SC-002**: Browser smoke covers save, apply, delete, persisted filter behavior, and no-execution boundary language.
- **SC-003**: Existing local validation passes: targeted tests, browser smoke, typecheck, lint, full tests, and build.

