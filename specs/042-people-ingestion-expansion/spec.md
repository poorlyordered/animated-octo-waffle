# Feature Specification: M42 People Ingestion Expansion

**Feature Branch**: `042-people-ingestion-expansion`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Prepare People ingestion from the command surface (Priority: P1)

As the project commander, I need to prepare a durable People ingestion request so member identity, role, activity, and delegation context can refresh through worker jobs instead of browser request paths.

**Independent Test**: A browser/API test prepares People ingestion and verifies a queued request appears in provenance with no worker dispatch, no ESI fetch, and no role/access mutation.

### User Story 2 - Let trusted workers claim and report People ingestion (Priority: P1)

As an operations maintainer, I need trusted workers to list, claim, complete, and fail People ingestion requests with auditable state transitions.

**Independent Test**: Unit and contract tests verify queued requests can be claimed once, completed only by the claiming worker, and failed with safe failure metadata.

### User Story 3 - Preserve browser-safe provenance (Priority: P2)

As the project commander, I need the People surface to show ingestion readiness, status, source count, section coverage, and failure state without exposing secrets or implying role/access execution.

**Independent Test**: Browser smoke verifies provenance updates after prepare and contains explicit no-execution language.

## Requirements

- **FR-001**: The People API MUST expose a commander-facing prepare endpoint for People ingestion requests.
- **FR-002**: Preparing People ingestion MUST create or surface one active queued/claimed request per corporation and MUST NOT dispatch a worker.
- **FR-003**: People ingestion history MUST include queued, claimed, completed, and failed states with timestamps and safe worker identifiers.
- **FR-004**: A worker-only People ingestion endpoint MUST require the configured worker callback secret.
- **FR-005**: Worker claim MUST atomically move queued requests to claimed and prevent duplicate claims.
- **FR-006**: Worker completion MUST record source count and identity/roles/activity/delegation section statuses.
- **FR-007**: Worker failure MUST record a safe reason and failed timestamp.
- **FR-008**: Browser and API responses MUST NOT include EVE access tokens, refresh tokens, worker secrets, OAuth secrets, sealing keys, MongoDB credentials, or raw external payloads.
- **FR-009**: This slice MUST NOT change EVE roles, access, standings, wallets, contracts, or external services from browser request paths.

## Success Criteria

- **SC-001**: Contract tests parse prepare and worker People ingestion request/response payloads.
- **SC-002**: Unit tests cover duplicate active prepare behavior and worker claim/complete/fail transitions.
- **SC-003**: Browser smoke shows prepare behavior and no-execution provenance language.
- **SC-004**: Full local validation passes before PR creation.

## Assumptions

- People ingestion workers are separate long-running processes that will fetch or normalize ESI/member data in later slices.
- This slice establishes the auditable job lifecycle and browser visibility; it does not grant, revoke, or mutate corporation roles/access.
