# Feature Specification: M53 Operations Health Saved Views

**Feature Branch**: `053-operations-health-saved-views`
**Created**: 2026-07-01
**Status**: Draft
**Input**: Roadmap M53: "Operations Health Saved Views. Add browser-local saved filter presets for operations health without server preference storage or provider calls."

## User Stories & Testing

### User Story 1 - Save and reapply operations-health views (Priority: P1)

As a commander reviewing operations posture, I need to save the current Operations Health warning and worker filters as a local view so I can quickly return to a focused health posture.

**Independent Test**: Browser smoke sets warning severity, worker status, and secret-state filters, saves the view, changes filters, reapplies the saved view, and verifies counts and visible summaries return to the saved state.

### User Story 2 - Manage saved views locally (Priority: P2)

As a maintainer, I need saved Operations Health views to remain browser-local and removable so they do not create server preference state or shared production data.

**Independent Test**: Unit coverage proves saved views parse safely, persist through localStorage adapters, de-duplicate identical filters, and recover from malformed local storage.

## Requirements

- **FR-001**: The Operations Health surface MUST allow saving the current warning severity, worker status, and worker secret filters as a saved view.
- **FR-002**: Saved views MUST be stored in browser `localStorage` only.
- **FR-003**: Applying a saved view MUST restore all three Operations Health filter controls.
- **FR-004**: Saving the same filter combination MUST de-duplicate the saved view rather than creating repeated entries.
- **FR-005**: A selected saved view MUST be removable from browser-local storage.
- **FR-006**: Malformed or stale saved-view storage MUST fail closed to an empty saved-view list.
- **FR-007**: This slice MUST NOT change `/api/operations-health`, store server preferences, call providers, dispatch workers, execute retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles/access/standings, or mutate external services.

## Success Criteria

- **SC-001**: Targeted Operations Health saved-view unit tests pass.
- **SC-002**: Browser smoke verifies save/apply/delete behavior and local-only boundary text.
- **SC-003**: Full typecheck, lint, unit, e2e, build, diff hygiene, and code-review-and-quality gate pass.

## Scope Boundaries

- M53 adds local saved views on top of M50 browser-local filters.
- M53 does not add backend saved preferences, cross-browser sync, user accounts, new operations-health query parameters, or provider calls.
