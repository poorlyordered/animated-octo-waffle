# Feature Specification: Live EVE SSO

**Feature Branch**: `009-live-eve-sso`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "M9: Add live EVE SSO identity validation and token handling through a server-side adapter. Exchange the callback code server-side, validate the signed EVE access-token JWT against official SSO metadata/JWKS, resolve character and corporation identity, keep EVE tokens and client secrets server-side only, preserve deterministic local test identity support, and continue using signed command-session scope cookies without executing player-impacting actions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In With Verified EVE Identity (Priority: P1)

A commander completes the EVE SSO callback and receives a Gryyk-47 command session only after the returned EVE identity has been validated against EVE SSO token rules.

**Why this priority**: Command scope should be grounded in real EVE identity before later command surfaces rely on live ESI-derived corporation context.

**Independent Test**: Can be tested by completing a callback with a valid authorization-code exchange fixture and verifying that the signed command session contains only character and corporation identity, not EVE tokens.

**Acceptance Scenarios**:

1. **Given** a valid SSO state and a valid EVE authorization code, **When** the callback completes, **Then** the system validates the EVE access token, resolves character and corporation identity, creates a command session scope, and redirects the commander to the requested local return path.
2. **Given** a callback returns a token that fails issuer, audience, expiry, or signature validation, **When** the callback is processed, **Then** the system rejects sign-in, clears transient SSO state, and does not create a command session.

---

### User Story 2 - Keep EVE Credentials Server-Side (Priority: P2)

A commander can trust that EVE client secrets, access tokens, and refresh tokens are handled only by server code and are never exposed through browser-safe APIs or session cookies.

**Why this priority**: EVE SSO secrets and tokens are command credentials; leaking them would violate the project security boundary and create unnecessary game-account risk.

**Independent Test**: Can be tested by inspecting callback responses, session state responses, and signed session payloads to confirm they only expose browser-safe identity fields.

**Acceptance Scenarios**:

1. **Given** a successful EVE SSO callback, **When** browser-visible session state is requested, **Then** the response includes command identity and scope status but excludes access tokens, refresh tokens, client secrets, and raw JWT claims.
2. **Given** EVE SSO configuration is incomplete, **When** a live callback is attempted, **Then** the system returns a safe error without exposing which secret value is missing.

---

### User Story 3 - Preserve Deterministic Local Auth Fixtures (Priority: P3)

A developer can continue validating command-session behavior locally without live EVE credentials by using the existing deterministic identity fixture path.

**Why this priority**: The project needs fast local validation and browser smoke tests that do not depend on live SSO availability.

**Independent Test**: Can be tested by setting the deterministic identity fixture and verifying the callback still creates a command session without contacting EVE services.

**Acceptance Scenarios**:

1. **Given** a deterministic test identity is configured, **When** the callback receives a valid local SSO state and code, **Then** the system uses the fixture identity and creates the same command session scope shape as a live sign-in.
2. **Given** no deterministic identity is configured, **When** the callback receives a valid local SSO state and code, **Then** the system uses the live server-side validation adapter.

---

### Operating Model Alignment

- **Numbers**: The feature does not add new numbers data, but it strengthens scoped access for later corporation wallet, asset, logistics, and activity reads.
- **Opportunity**: The feature does not add opportunity recommendations, but it prepares trusted commander identity for future ESI-backed opportunity data.
- **People**: Character and corporation identity establish the commander session context for future member, role, and delegation surfaces.
- **Decision Boundary**: Observation only. The feature authenticates identity and session scope; it does not recommend, draft, approve, or execute game actions.
- **Automation Boundary**: Safe automatic validation only. The system exchanges and validates SSO tokens, but it does not store long-lived EVE tokens or perform player-impacting actions.

### Edge Cases

- Callback is missing code or state.
- Callback state is missing, tampered with, expired, or does not match the query-string state.
- Live token exchange fails or returns a malformed response.
- EVE access token is malformed, expired, signed with an unknown key, has an unsupported algorithm, has an invalid issuer, or lacks the required audience.
- Token subject does not contain a character identifier or lacks a usable character name.
- ESI character or corporation lookup fails after token validation.
- Deterministic local identity fixture is malformed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST exchange an EVE SSO callback authorization code for token material using only server-side configuration.
- **FR-002**: System MUST validate the returned EVE access token before trusting identity data.
- **FR-003**: System MUST validate token signature, issuer, expiry, and audience against EVE SSO requirements.
- **FR-004**: System MUST extract the authenticated character identifier and character name from a validated EVE token.
- **FR-005**: System MUST resolve the authenticated character's corporation identifier and corporation name before creating command session scope.
- **FR-006**: System MUST create the same browser-safe command session scope shape for live and deterministic sign-ins.
- **FR-007**: System MUST keep EVE client secrets, access tokens, refresh tokens, and raw token claims out of browser-visible responses and command session cookies.
- **FR-008**: System MUST clear transient SSO state on failed callbacks.
- **FR-009**: System MUST preserve the deterministic local identity fixture path for repeatable local validation.
- **FR-010**: System MUST produce safe user-facing errors for SSO failures without exposing secret names, token values, or raw provider payloads.

### Key Entities *(include if feature involves data)*

- **EVE SSO Configuration**: Server-side settings needed for authorization-code exchange and token validation.
- **EVE Token Exchange Result**: Short-lived server-only token material returned by EVE SSO.
- **Validated EVE Identity Claims**: Trusted character identity derived from a verified access token.
- **EVE Corporation Identity**: Corporation identifier and display name resolved for the authenticated character.
- **Command Session Scope**: Browser-safe signed session identity used by Gryyk-47 command APIs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A successful live callback creates a command session only after access-token validation and corporation identity resolution complete.
- **SC-002**: Invalid token issuer, audience, expiry, signature, or subject cases are rejected in automated tests.
- **SC-003**: Browser-visible session responses and signed command session payloads contain no EVE access tokens, refresh tokens, client secrets, or raw JWT claims.
- **SC-004**: Existing deterministic local sign-in tests and browser smoke tests continue to pass without live EVE credentials.
- **SC-005**: Full local validation covers lint, typecheck, unit/contract tests, browser smoke tests, and production build.

## Assumptions

- This slice does not persist refresh tokens or add long-lived ESI sync. That should be a separate explicit-consent feature.
- EVE SSO metadata and JWKS endpoints are treated as server-side dependencies and may be cached only within server runtime memory.
- Live ESI lookups used for identity resolution are read-only and do not mutate game state.
- Existing signed command session cookies remain the app's browser-facing session mechanism.
- Existing local fallback scope remains available for missing-session development and non-live validation.
