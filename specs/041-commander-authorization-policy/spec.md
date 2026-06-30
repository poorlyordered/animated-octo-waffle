# Feature Specification: M41 Commander Authorization Policy

**Feature Branch**: `041-commander-authorization-policy`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Reject mismatched signed-in corporations (Priority: P1)

As the project commander, I need command APIs to reject a signed EVE session from a different corporation so a valid login cannot inspect or mutate the configured command corporation's data.

**Independent Test**: Unit and contract tests send a signed session for a non-configured corporation and verify command scope is unauthorized, not silently resolved to the session corporation or fallback corporation.

### User Story 2 - Preserve local fallback development scope (Priority: P2)

As a developer, I need no-session local fallback scope to continue working for deterministic tests and local development.

**Independent Test**: Existing fallback tests continue to resolve `EVEONLINE_CORPORATION_ID` when no valid session cookie exists.

### User Story 3 - Surface unauthorized session state safely (Priority: P3)

As the project commander, I need the browser session state to show an unauthorized signed-in corporation without exposing secrets or token material.

**Independent Test**: Session-state contract parses an unauthorized state that includes display-safe character/corporation identity and safe reason text only.

## Requirements

- **FR-001**: A signed EVE session MUST be authorized only when its corporation id matches the server-owned `EVEONLINE_CORPORATION_ID`.
- **FR-002**: A signed session with a mismatched corporation MUST be rejected with a safe unauthorized response for command APIs.
- **FR-003**: A mismatched signed session MUST NOT fall back to `EVEONLINE_CORPORATION_ID` for command API access.
- **FR-004**: Missing or invalid session cookies MUST continue to use fallback scope when `EVEONLINE_CORPORATION_ID` is configured.
- **FR-005**: Session-state responses MUST safely distinguish authorized session, fallback, missing, and unauthorized session states.
- **FR-006**: Browser responses MUST NOT include access tokens, refresh tokens, token hashes, session secrets, OAuth secrets, worker secrets, sealing keys, or MongoDB credentials.
- **FR-007**: This slice MUST NOT mutate EVE state, wallets, assets, contracts, roles, standings, external services, worker dispatch, or queued work.

## Success Criteria

- **SC-001**: Unit tests cover authorized session, unauthorized mismatched session, fallback, and missing state.
- **SC-002**: Contract tests cover a command API returning 403 for mismatched signed-session corporation.
- **SC-003**: Session-state schema and browser component handle unauthorized state without exposing secrets.
- **SC-004**: Full local validation passes before PR creation.

## Assumptions

- `EVEONLINE_CORPORATION_ID` remains the server-owned command corporation id for this slice.
- Future slices may add role-based commander allowlists, but this slice gates corporation membership first.
