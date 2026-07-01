# Feature Specification: Auth Landing Gate

**Feature Branch**: `057-auth-landing-gate`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Build a landing page based on the original `/mnt/f/Eve AI/project` front page, not for marketing purposes, but so only logged in users can see Gryyk-47 command information. Use the Spec Kit driven process and apply frontend skill guidance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gate Command Data Behind EVE Session (Priority: P1)

As an unauthenticated visitor, I only see a Gryyk-47 landing/login gate with EVE SSO sign-in, and no corporation command data is rendered or fetched.

**Why this priority**: The current app renders command surfaces immediately and depends on a fallback corporation scope. The first increment must prevent unauthenticated visitors from seeing command information.

**Independent Test**: Open the app with no signed EVE session in a production-like configuration. The page shows the login gate, does not render command surfaces, and browser network activity does not request command data APIs.

**Acceptance Scenarios**:

1. **Given** no signed EVE session exists, **When** the visitor opens `/`, **Then** the system shows a Gryyk-47 login gate with an EVE SSO sign-in action and no command brief, numbers, opportunity, people, decision, queue, ESI, operations, or production evidence content.
2. **Given** no signed EVE session exists, **When** the app shell finishes loading, **Then** command data surfaces are not mounted and command data API requests are not started by the browser.
3. **Given** no signed EVE session exists in production, **When** a command data API is requested directly, **Then** the system returns a safe unauthorized response instead of fallback corporation data.

---

### User Story 2 - Enter Command Center After Authorized Session (Priority: P2)

As an authorized corporation user, I can sign in through EVE SSO and then see the existing Gryyk-47 command operating surfaces.

**Why this priority**: The login gate must not block legitimate commanders from the existing command loop once their signed session is valid and authorized for the configured corporation.

**Independent Test**: Load the app with a valid signed EVE session for the configured corporation. The command surfaces render and the command scope status shows the signed-in character and corporation.

**Acceptance Scenarios**:

1. **Given** a valid signed EVE session matches the server-owned corporation, **When** the user opens `/`, **Then** the existing command surfaces render and the session status identifies the signed-in character and corporation.
2. **Given** an authenticated user signs out, **When** sign-out completes, **Then** command surfaces are removed and the landing/login gate is shown again.

---

### User Story 3 - Explain Unauthorized Corporation State (Priority: P3)

As a signed-in EVE user from another corporation, I receive a clear access-state explanation without seeing Gryyk-47 command data.

**Why this priority**: Mismatched corporation sessions are an expected authorization failure and need a safe, understandable UI state.

**Independent Test**: Load the app with a signed session whose corporation does not match the configured command corporation. The app shows an unauthorized state and offers sign-out or retry without rendering command surfaces.

**Acceptance Scenarios**:

1. **Given** a signed EVE session belongs to another corporation, **When** the user opens `/`, **Then** the system shows an unauthorized corporation state with safe display metadata and no command data surfaces.
2. **Given** an unauthorized corporation state, **When** the user signs out, **Then** the system clears the session and returns to the landing/login gate.

### Operating Model Alignment

- **Numbers**: Protects Numbers surfaces and direct Numbers API data from unauthenticated production access.
- **Opportunity**: Protects command briefs, research status, and Opportunity surfaces from unauthenticated production access.
- **People**: Protects People member and follow-up surfaces from unauthenticated production access.
- **Decision Boundary**: Authentication and authorization gate only; it does not create observations, recommendations, draft orders, or executed actions.
- **Automation Boundary**: Manual sign-in and sign-out only; no worker dispatch, retry scheduling, ESI fetch, EVE write, queue mutation, or external-service action is introduced.

### Edge Cases

- Missing session state endpoint response shows a safe unavailable state and does not mount command surfaces.
- Local development and deterministic tests may still use explicit fallback configuration, but production command data must not be readable through fallback alone.
- A signed session from a different corporation remains unauthorized and must not fall back to the configured corporation.
- The landing gate must avoid exposing server secrets, MongoDB configuration, token material, ESI scopes beyond high-level sign-in context, or raw production data.
- EVE SSO misconfiguration should show a safe sign-in unavailable state or safe redirect failure rather than exposing provider errors or secrets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show an unauthenticated landing/login gate at `/` when no signed EVE session is present.
- **FR-002**: The landing/login gate MUST be based on the original front-page intent from `/mnt/f/Eve AI/project`, adapted to Gryyk-47 as a corporation command operating system rather than a marketing page.
- **FR-003**: The landing/login gate MUST include a sign-in action that uses the existing server-owned EVE SSO start endpoint.
- **FR-004**: The browser MUST NOT mount command data surfaces or initiate command data API reads until the session state is signed in and authorized.
- **FR-005**: Production command data APIs MUST require an authorized signed EVE session and MUST NOT expose command data through no-session fallback.
- **FR-006**: Local development and deterministic tests MAY retain an explicit fallback path when configured outside production.
- **FR-007**: A signed session whose corporation does not match the configured corporation MUST show a safe unauthorized state and MUST NOT expose command data.
- **FR-008**: Sign-out MUST clear the signed session and return the browser to the landing/login gate without rendering command data.
- **FR-009**: The landing/login gate MUST communicate that EVE SSO is used for authentication and that Gryyk-47 does not store EVE account passwords.
- **FR-010**: The implementation MUST keep EVE SSO secrets, session secrets, MongoDB credentials, ESI token material, worker secrets, and command data server-side.

### Key Entities *(include if feature involves data)*

- **Session Access State**: Browser-safe state returned by the session endpoint, including signed-in, fallback, missing, and unauthorized states.
- **Landing Gate**: The unauthenticated app state that presents Gryyk-47 identity, command-system capability cues, and EVE SSO entry without command data.
- **Command Shell**: The existing authenticated surface group containing command brief, numbers, opportunity, decisions, automation queue, people, ESI, operations health, and production evidence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With no signed session in a production-like configuration, `/` renders the landing/login gate and zero command data panels.
- **SC-002**: With no signed session in a production-like configuration, direct requests to protected command APIs return safe unauthorized responses.
- **SC-003**: With an authorized signed session, existing command surfaces render without requiring the user to visit a separate route.
- **SC-004**: With a mismatched corporation session, the user sees an unauthorized state and no command surface content.
- **SC-005**: Automated browser validation confirms unauthenticated app load does not start command data API requests.

## Assumptions

- The new app continues to use the existing `/api/eve-session`, `/api/eve-session/sign-out`, and `/api/eve-sso-start` endpoints.
- The legacy front page is a visual and content reference only; legacy client-side token storage and client-generated OAuth URLs are out of scope.
- The first authenticated destination remains `/` and the current command surfaces remain a single command shell rather than separate routed pages.
- Production means `NODE_ENV=production` or an equivalent Netlify runtime environment where fallback command data access is not acceptable.
