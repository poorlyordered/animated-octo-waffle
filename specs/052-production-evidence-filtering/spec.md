# Feature Specification: M52 Production Evidence Filtering

**Feature Branch**: `052-production-evidence-filtering`
**Created**: 2026-07-01
**Status**: Draft

## User Stories & Testing

### User Story 1 - Filter evidence by environment and decision (Priority: P1)

As an operations maintainer, I need to filter Production Evidence records by environment and go/no-go decision so I can quickly inspect the posture relevant to the current release review.

**Independent Test**: Browser smoke selects environment and decision filters and verifies visible evidence rows and counts update without calling a server preference or export endpoint.

### User Story 2 - Filter evidence by check status (Priority: P1)

As the project commander, I need to isolate evidence records with blocked or attention checks so I can focus on unresolved production readiness concerns.

**Independent Test**: Unit tests verify records match when any fixed check has the selected status, and browser smoke verifies empty filtered states.

### User Story 3 - Preserve value-free evidence boundaries (Priority: P2)

As a maintainer, I need filtering to organize already visible evidence only, without exporting production data or adding deploy/rollback actions.

**Independent Test**: Browser smoke verifies the filter boundary text and confirms no export, deploy, or rollback command buttons appear on the Production Evidence surface.

## Requirements

- **FR-001**: The Production Evidence browser surface MUST expose environment filters for `all`, `production`, `staging`, and `controlled_staging`.
- **FR-002**: The Production Evidence browser surface MUST expose decision filters for `all`, `go`, `no_go`, and `controlled_staging`.
- **FR-003**: The Production Evidence browser surface MUST expose check-status filters for `all`, `verified`, `attention`, `blocked`, and `not_applicable`.
- **FR-004**: Filters MUST be browser-local only and MUST NOT change `/api/production-evidence`, store server preferences, or add export endpoints.
- **FR-005**: Filter counts MUST show visible records against total browser-visible records.
- **FR-006**: Empty filtered states MUST be explicit.
- **FR-007**: This slice MUST NOT export production data, deploy, rollback, call live providers, dispatch workers, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles/access/standings, or mutate external services.

## Success Criteria

- **SC-001**: Targeted production evidence filter unit tests pass.
- **SC-002**: Browser smoke verifies environment, decision, and check-status filters.
- **SC-003**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.
- **SC-004**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M52 Spec Kit artifacts agree on the active M52 feature while this branch is in review.
- **SC-005**: `docs/roadmap.md` includes M52 completion evidence and names M53 as the next recommended slice.

## Assumptions

- M52 organizes the existing production-evidence list response only.
- Browser-local filters do not need persistence in this slice.
