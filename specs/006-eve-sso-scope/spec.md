# Feature Specification: EVE SSO Session Scope

**Feature Branch**: `006-eve-sso-scope`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Add EVE SSO session-derived corporation scope so Gryyk-47 can bind command API reads and writes to an authenticated commander session instead of relying only on EVEONLINE_CORPORATION_ID. Keep MongoDB credentials and tokens server-side, preserve env fallback for local development, and do not perform EVE writes or long-running ESI sync in request paths."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In To Establish Command Scope (Priority: P1)

As a commander, I want to sign in with EVE SSO so Gryyk-47 can identify my character and corporation scope before showing command data.

**Why this priority**: The current app uses a server-configured corporation ID for all users. Before adding more sensitive worker or numbers capabilities, command APIs need a path to derive scope from an authenticated session.

**Independent Test**: Simulate a successful SSO callback with deterministic identity data, then open the app and verify command APIs resolve the session corporation scope without browser-provided corporation IDs.

**Acceptance Scenarios**:

1. **Given** a commander has no active session, **When** they open Gryyk-47, **Then** the app shows sign-in state or local fallback state without exposing server secrets.
2. **Given** EVE SSO returns a valid identity, **When** the callback completes, **Then** Gryyk-47 stores a server-owned session scope containing character identity and corporation ID.
3. **Given** a session scope exists, **When** command APIs read or write command data, **Then** they use the session corporation ID instead of accepting corporation identity from browser-controlled inputs.

---

### User Story 2 - Preserve Local Development Fallback (Priority: P2)

As a developer, I want local development and tests to keep working with `EVEONLINE_CORPORATION_ID` when no authenticated EVE session exists.

**Why this priority**: Existing specs, fixtures, quickstarts, and test data rely on deterministic single-corporation scope. M6 should evolve scope handling without blocking local work or requiring live EVE SSO for every validation run.

**Independent Test**: Run existing contract/unit/browser validations without an SSO session and verify server APIs continue to use the configured fallback corporation scope.

**Acceptance Scenarios**:

1. **Given** no session cookie is present and fallback scope is configured, **When** command APIs run in local development, **Then** they continue to resolve the fallback corporation scope.
2. **Given** no session cookie is present and fallback scope is not configured, **When** command APIs run, **Then** they fail safely with a scope-not-configured response.
3. **Given** a session cookie and fallback scope both exist, **When** command APIs run, **Then** the authenticated session scope takes precedence.

---

### User Story 3 - Inspect Session And Sign Out (Priority: P3)

As a commander, I want the app to show which EVE character/corporation scope is active and allow me to sign out.

**Why this priority**: Scope must be inspectable so commanders know which corporation context they are viewing, and sign-out must clear server-owned scope.

**Independent Test**: Simulate an active session, verify the app displays character/corporation scope metadata, then sign out and verify the session no longer authorizes command scope.

**Acceptance Scenarios**:

1. **Given** a commander has an active session, **When** they open Gryyk-47, **Then** they can see the active character and corporation scope.
2. **Given** a commander signs out, **When** the sign-out completes, **Then** the server session is cleared and command APIs no longer use that session scope.
3. **Given** a stale or invalid session exists, **When** the app asks for session state, **Then** Gryyk-47 reports signed-out state and does not expose token details.

---

### Operating Model Alignment

- **Numbers**: Session scope is a prerequisite for future wallet, asset, logistics, and measurable corporation data access.
- **Opportunity**: Session scope keeps command brief and decision data scoped to the authenticated corporation.
- **People**: Session scope protects member profile and follow-up data from being shown under the wrong corporation.
- **Decision Boundary**: Authenticated scope is an access boundary and observation context, not an approval or executed action.
- **Automation Boundary**: Manual sign-in/sign-out and safe automatic scope resolution only. No EVE writes, role changes, worker dispatch, or long-running sync happens in this feature.

### Edge Cases

- EVE SSO callback is missing state, has invalid state, or is replayed.
- EVE SSO identity cannot be resolved or does not include corporation scope.
- Session cookie is missing, expired, malformed, or tampered with.
- Fallback corporation scope is configured for local development but an authenticated session also exists.
- Browser attempts to provide corporation ID through query parameters, headers, body fields, or local storage.
- Sign-out is requested when no active session exists.
- EVE SSO secrets or token details would otherwise appear in browser-visible responses or logs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a server-owned sign-in start flow for EVE SSO.
- **FR-002**: System MUST validate EVE SSO callback state before creating a session.
- **FR-003**: System MUST create a server-owned session scope containing character ID, character name, corporation ID, and corporation name when SSO identity is valid.
- **FR-004**: System MUST store EVE SSO tokens and session secrets server-side only and MUST NOT expose them to the browser.
- **FR-005**: Command APIs MUST resolve corporation scope from an authenticated session when one exists.
- **FR-006**: Command APIs MUST keep ignoring browser-controlled corporation identity in headers, query parameters, local storage, and request bodies.
- **FR-007**: System MUST preserve `EVEONLINE_CORPORATION_ID` fallback scope for local development and tests when no authenticated session exists.
- **FR-008**: Authenticated session scope MUST take precedence over fallback scope when both exist.
- **FR-009**: System MUST provide a safe session-state endpoint that returns signed-in status and display-safe character/corporation metadata only.
- **FR-010**: System MUST provide a sign-out flow that clears server-owned session state.
- **FR-011**: System MUST fail safely when neither session scope nor fallback scope is available.
- **FR-012**: System MUST NOT perform EVE writes, role/access changes, wallet/asset actions, standings changes, worker dispatch, or long-running ESI sync in this feature.
- **FR-013**: Auth/session validation MUST be covered by contract/unit tests and the browser smoke suite MUST cover signed-in and signed-out visible states.

### Key Entities *(include if feature involves data)*

- **EveSessionScope**: Server-owned authenticated command scope. Includes character ID, character name, corporation ID, corporation name, issued timestamp, and expiration timestamp.
- **EveSsoState**: Short-lived anti-forgery state used to bind sign-in start and callback.
- **SessionStateResponse**: Browser-safe session state describing whether a commander is signed in and which display-safe character/corporation metadata is active.
- **ScopeResolutionResult**: Internal result used by server functions to distinguish authenticated session scope, fallback environment scope, and missing scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Existing command API tests pass with fallback corporation scope and no EVE session.
- **SC-002**: Session-scope tests prove authenticated scope takes precedence over fallback scope.
- **SC-003**: Browser smoke validation covers signed-out/fallback and signed-in display states.
- **SC-004**: No browser-visible response contains access tokens, refresh tokens, client secrets, or MongoDB credentials.
- **SC-005**: Attempts to supply browser-controlled corporation identity do not change resolved command API scope.

## Assumptions

- This feature can use deterministic SSO callback fixtures for local tests rather than live EVE SSO.
- Live EVE SSO app credentials will be configured later through server-side environment variables.
- Full EVE token refresh, ESI sync, corp membership authorization policy, and role/access enforcement are future slices.
- `EVEONLINE_CORPORATION_ID` remains valid as a local/test fallback until live session-derived scope is fully validated.
