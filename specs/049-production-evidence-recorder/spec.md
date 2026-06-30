# Feature Specification: M49 Production Evidence Recorder

**Feature Branch**: `049-production-evidence-recorder`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Record value-free deployment evidence (Priority: P1)

As the project commander, I need an operator-facing record of deployment readiness evidence so production go/no-go context survives beyond chat and PR comments.

**Independent Test**: Contract/unit tests verify production evidence responses accept only structured posture fields and reject obvious secret, token, connection string, cookie, JWT, and production export material before storage.

### User Story 2 - Keep evidence scoped to command authority (Priority: P1)

As an operator, I need records scoped by the server-owned command corporation, not browser-selected corporation ids, so evidence cannot be attached to arbitrary tenants.

**Independent Test**: API/store tests verify records are created under the resolved command scope and include safe operator attribution from the signed session when present.

### User Story 3 - Surface recent evidence without executing operations (Priority: P2)

As a maintainer, I need a browser surface for recent production evidence and a bounded create form without live provider checks, deploy execution, rollback execution, worker dispatch, or EVE mutation.

**Independent Test**: Browser/unit coverage verifies the production evidence surface renders recent records and boundary language using the shared contract fixture.

## Requirements

- **FR-001**: The shared contract MUST define production evidence records with environment, decision, commit SHA, optional PR/deploy/rollback identifiers, fixed validation checks, operator attribution, timestamp, and boundary text.
- **FR-002**: The create API MUST resolve corporation scope server-side through the existing command auth scope.
- **FR-003**: The create API MUST reject request keys and string values that indicate secrets, tokens, cookies, JWTs, connection strings, private keys, raw production records, or production exports.
- **FR-004**: The list API MUST return recent scoped records only and include no secret values or raw production data.
- **FR-005**: The browser surface MUST use fixed check keys and bounded evidence text rather than raw log upload or arbitrary payload storage.
- **FR-006**: This slice MUST NOT deploy, rollback, call live provider APIs, fetch ESI, write to EVE, dispatch workers, execute retries, mutate wallets/assets/contracts/roles/access/standings, or store production record exports.

## Success Criteria

- **SC-001**: Targeted production evidence contract/unit tests pass.
- **SC-002**: Full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M49 Spec Kit artifacts agree on the active M49 feature while this branch is in review.
- **SC-004**: `docs/roadmap.md` includes M49 completion evidence and names M50 as the next recommended slice.

## Assumptions

- Current command auth exposes signed session or configured fallback scope, but not a separate role table. M49 therefore uses the existing command API scope and safe session attribution without adding a new authorization system.
- Evidence records are operational metadata, not deployment automation.
