# Feature Specification: M48 Live Read Consent Expansion

**Feature Branch**: `048-live-read-consent-expansion`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Prepare read consent for more operating legs (Priority: P1)

As the project commander, I need the ESI read-consent surface to show Numbers, People, and Opportunity read-sync domains so future ingestion can be prepared without inventing new consent flows later.

**Independent Test**: Browser smoke verifies the ESI token vault renders Numbers, People, and Opportunity read-sync domains and can prepare a queued People or Opportunity sync request without fetching ESI or dispatching a worker.

### User Story 2 - Keep expanded consent planning non-executing (Priority: P1)

As an operator, I need People and Opportunity sync requests to remain planning records until a later worker feature defines execution, so existing Numbers worker execution cannot accidentally run the new domains.

**Independent Test**: Contract/unit tests verify People and Opportunity domains are valid prepare targets, while the ESI sync worker only lists/runs Numbers sync requests by default and rejects non-Numbers run attempts.

### User Story 3 - Keep token material and scopes server-side (Priority: P2)

As a future maintainer, I need expanded consent to continue storing token material server-side only and exposing scope names/statuses without secrets.

**Independent Test**: Contract/unit tests verify domain summaries expose required scope names and availability only; browser smoke verifies responses still include no access tokens, refresh tokens, sealing keys, OAuth secrets, worker secrets, or raw ESI payloads.

## Requirements

- **FR-001**: `EsiSyncDomain` MUST support `numbers`, `people`, and `opportunity`.
- **FR-002**: The ESI vault status response MUST list all supported read-sync domains with labels, required read-only scopes, availability, and missing scopes.
- **FR-003**: The prepare sync API MUST accept `people` and `opportunity` domains and create duplicate-safe queued sync records when the active vault has the required scopes.
- **FR-004**: People and Opportunity queued sync records MUST remain planning-only records until later worker features define execution.
- **FR-005**: The ESI sync worker MUST NOT run non-Numbers sync requests in this slice.
- **FR-006**: Browser responses MUST NOT include access tokens, refresh tokens, token hashes, sealing keys, OAuth secrets, worker secrets, MongoDB credentials, raw ESI payloads, dispatch targets, or execution handles.
- **FR-007**: This slice MUST NOT fetch ESI for People or Opportunity, write to EVE, mutate wallets/assets/contracts/roles/access/standings, dispatch workers, execute retries, or mutate external services.

## Success Criteria

- **SC-001**: Browser smoke verifies Numbers, People, and Opportunity read-sync domains are visible and a non-Numbers prepare action returns queued planning-only boundary text.
- **SC-002**: Targeted tests cover multi-domain scope summaries, prepare payload validation, and worker non-Numbers execution rejection.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M48 Spec Kit artifacts agree on the active M48 feature while this branch is in review.
- **SC-004**: `docs/roadmap.md` includes M48 completion evidence and names M49 as the next recommended slice.
- **SC-005**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.

## Assumptions

- M48 expands consent and queued planning only; worker execution for People and Opportunity remains a future feature.
- Read-only scope names are recorded as operator-facing configuration; live provider verification remains covered by M46 production operations.
