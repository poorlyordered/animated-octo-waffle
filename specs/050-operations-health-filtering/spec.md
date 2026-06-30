# Feature Specification: M50 Operations Health Filtering

**Feature Branch**: `050-operations-health-filtering`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Filter operations warnings locally (Priority: P1)

As the project commander, I need to filter Operations Health warnings by severity so I can focus on blocked or warning-level items without losing the overall read-only health context.

**Independent Test**: Browser smoke selects a warning severity filter and verifies visible warning counts and warning rows update without API preference writes or execution controls.

### User Story 2 - Filter worker readiness locally (Priority: P1)

As an operator, I need to filter worker readiness by status and secret state so I can isolate blocked, degraded, fallback, or missing worker posture quickly.

**Independent Test**: Unit tests verify worker readiness filters produce the expected visible worker list, and browser smoke verifies blocked/missing filters hide unrelated worker rows.

### User Story 3 - Preserve no-execution operations boundary (Priority: P2)

As a maintainer, I need filters to organize only browser-visible summaries while preserving the Operations Health API as read-only and side-effect free.

**Independent Test**: Browser smoke verifies the filter boundary text and confirms the Operations Health surface still exposes no buttons or execution controls.

## Requirements

- **FR-001**: The Operations Health browser surface MUST expose a warning severity filter with `all`, `info`, `warning`, and `critical`.
- **FR-002**: The Operations Health browser surface MUST expose worker readiness filters for status and secret state.
- **FR-003**: Filters MUST be browser-local only and MUST NOT call a preference API, write server preference state, or change the `/api/operations-health` contract.
- **FR-004**: Filter counts MUST show visible warnings/workers against total browser-visible warnings/workers.
- **FR-005**: Empty filtered states MUST be explicit for warning and worker readiness lists.
- **FR-006**: This slice MUST NOT call live providers, dispatch workers, execute retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles/access/standings, or mutate external services.

## Success Criteria

- **SC-001**: Targeted operations health filter unit tests pass.
- **SC-002**: Browser smoke verifies warning and worker filters on the Operations Health surface.
- **SC-003**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.
- **SC-004**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M50 Spec Kit artifacts agree on the active M50 feature while this branch is in review.
- **SC-005**: `docs/roadmap.md` includes M50 completion evidence and names M51 as the next recommended slice.

## Assumptions

- M50 organizes the existing operations-health response only. Server-side health computation remains owned by M47.
- Browser-local filters do not need persistence in this slice.
