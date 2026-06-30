# Feature Specification: M43 Opportunity Ingestion Expansion

**Feature Branch**: `043-opportunity-ingestion-expansion`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Prepare Opportunity ingestion from the command surface (Priority: P1)

As the project commander, I need to prepare a durable Opportunity ingestion request so official news and strategic context can refresh through worker jobs instead of browser display paths.

**Independent Test**: A browser/API test prepares Opportunity ingestion and verifies a queued research request appears in provenance with no research pull, worker dispatch, ESI fetch, EVE write, or external-service execution.

### User Story 2 - Let trusted workers claim and report Opportunity ingestion (Priority: P1)

As an operations maintainer, I need trusted workers to list, claim, complete, and fail Opportunity ingestion requests with auditable state transitions.

**Independent Test**: Unit and contract tests verify queued Opportunity requests can be claimed once, completed only by the claiming worker, and failed with safe failure metadata.

### User Story 3 - Preserve browser-safe Opportunity provenance (Priority: P2)

As the project commander, I need the Opportunity surface to show ingestion readiness, status, source count, section coverage, and failure state without exposing secrets or implying research execution from the browser.

**Independent Test**: Browser smoke verifies provenance updates after prepare and contains explicit no-execution language.

## Requirements

- **FR-001**: The command brief API MUST expose a commander-facing prepare endpoint for Opportunity ingestion requests.
- **FR-002**: Preparing Opportunity ingestion MUST create or surface one active queued/processing request per corporation and focus and MUST NOT schedule research pulls or dispatch a worker.
- **FR-003**: Opportunity ingestion history MUST include queued, processing, processed, and failed states with timestamps and safe worker identifiers.
- **FR-004**: A worker-only Opportunity ingestion endpoint MUST require the configured worker callback secret.
- **FR-005**: Worker claim MUST atomically move queued requests to processing and prevent duplicate claims.
- **FR-006**: Worker completion MUST record source count and sources/impacts/recommendations/watchlist section statuses.
- **FR-007**: Worker failure MUST record a safe reason and failed timestamp through browser-safe history.
- **FR-008**: Browser and API responses MUST NOT include OAuth secrets, worker secrets, EVE tokens, MongoDB credentials, raw external payloads, or unreviewed AI prompt payloads.
- **FR-009**: This slice MUST NOT write to EVE, schedule research from browser display paths, call external research services from request paths, or mutate external services.

## Success Criteria

- **SC-001**: Contract tests parse prepare and worker Opportunity ingestion request/response payloads.
- **SC-002**: Unit tests cover duplicate active prepare behavior and worker claim/complete/fail transitions.
- **SC-003**: Browser smoke shows prepare behavior and no-execution provenance language.
- **SC-004**: Full local validation passes before PR creation.

## Assumptions

- Opportunity workers are separate long-running processes that will fetch, process, and persist final command briefs in later slices.
- This slice establishes the auditable request lifecycle and browser visibility; it does not execute research collection or external-service calls in request paths.
