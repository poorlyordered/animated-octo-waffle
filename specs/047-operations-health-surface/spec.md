# Feature Specification: M47 Operations Health Surface

**Feature Branch**: `047-operations-health-surface`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Inspect command API readiness (Priority: P1)

As the project commander, I need a read-only operations health surface that summarizes whether the core command API areas have enough server-side configuration and data evidence to be inspected safely.

**Independent Test**: Load the command center with deterministic fixtures and verify an Operations Health surface lists command APIs, statuses, evidence, and no-execution boundary language.

### User Story 2 - See ingestion, retry, and worker posture without secrets (Priority: P1)

As an operator, I need the health surface to show ingestion histories, retry posture, and worker callback readiness using safe counts and timestamps without exposing worker secrets, OAuth secrets, MongoDB credentials, token material, or dispatch targets.

**Independent Test**: Contract/unit tests validate the response schema accepts counts, timestamps, class secret states, and warning summaries while rejecting missing required fields; browser smoke verifies no secret values or execution controls are rendered.

### User Story 3 - Preserve operations boundaries (Priority: P2)

As a future maintainer, I need the health surface to remain observational so it cannot dispatch workers, fetch ESI, write to EVE, mutate external services, or bypass commander approval.

**Independent Test**: Review the API contract and browser smoke output to verify the surface has no action controls and includes explicit no-execution boundary text.

## Requirements

- **FR-001**: The system MUST expose a read-only `GET /api/operations-health` endpoint returning browser-safe operations health data for the current command corporation scope.
- **FR-002**: The response MUST include command API status summaries for command brief, Numbers, Opportunity, People, Decision Records, Automation Queue, and ESI sync.
- **FR-003**: The response MUST include ingestion status summaries for Numbers ESI sync, People ingestion, and Opportunity ingestion using counts and latest timestamps only.
- **FR-004**: The response MUST include retry posture counts by retry status and target type.
- **FR-005**: The response MUST include worker readiness summaries for worker handoff, retry worker, ESI sync, People ingestion, and Opportunity ingestion callback classes using only `configured`, `fallback`, or `missing` secret state.
- **FR-006**: The response MUST include warnings for missing required server configuration and missing production operations evidence without exposing values.
- **FR-007**: The browser MUST render an Operations Health surface with sections for command APIs, ingestion, retries, worker readiness, warnings, and boundary language.
- **FR-008**: The endpoint and browser MUST NOT expose secret values, MongoDB credentials, OAuth secrets, worker secrets, sealing keys, access tokens, refresh tokens, token hashes, cookies, raw ESI payloads, dispatch targets, or production record exports.
- **FR-009**: This slice MUST NOT add live provider checks from the browser, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service mutation.

## Success Criteria

- **SC-001**: Browser smoke test verifies Operations Health renders with deterministic command API, ingestion, retry, worker readiness, warning, and no-execution boundary content.
- **SC-002**: Contract/unit tests cover the operations health schema and server-side summary builder for safe secret-state output.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M47 Spec Kit artifacts agree on the active M47 feature while this branch is in review.
- **SC-004**: `docs/roadmap.md` includes M47 completion evidence and names M48 as the next recommended slice.
- **SC-005**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.

## Assumptions

- M47 is a read-only command surface and does not deploy or verify live provider consoles.
- Health status can be computed from current MongoDB collections and server environment variable presence without reading or returning secret values.
- Missing live production evidence remains documented in `docs/production-operations.md`; M47 surfaces operational posture, not proof of production readiness.
