# Research: EVE SSO Session Scope

## Decision: Use EVE SSO Authorization Code flow for web sign-in

**Rationale**: Official EVE developer documentation describes EVE SSO as OAuth 2.0. For web applications that can keep a client secret server-side, the Authorization Code flow redirects the user to EVE, receives a code and state, verifies state, exchanges the code for tokens, and validates the access token before using it. This fits Netlify functions because the client secret stays server-side.

**Source**: EVE Developer Documentation, Single Sign-On: https://developers.eveonline.com/docs/services/sso/

**Alternatives considered**:

- PKCE-only native flow: useful for clients that cannot keep a secret, but this app has server functions.
- Browser-only OAuth handling: rejected because tokens and secrets must not be exposed to the browser.

## Decision: Validate state and token identity before creating session scope

**Rationale**: Official docs call out the state parameter for CSRF protection and JWT validation requirements: signature, issuer, expiration, and audience. M6 can use deterministic test fixtures locally, but the production path must be shaped around these checks.

**Source**: EVE Developer Documentation, Single Sign-On and JWT validation sections: https://developers.eveonline.com/docs/services/sso/

**Alternatives considered**:

- Trust callback query parameters: rejected because browser-controlled values could forge scope.
- Store only env scope: rejected because M6’s purpose is authenticated session-derived scope.

## Decision: Signed HTTP-only session-scope cookie, no token persistence in M6

**Rationale**: M6 needs authenticated command scope, not long-lived ESI access. A signed cookie containing display-safe character/corporation metadata lets command APIs resolve scope without exposing tokens. Token refresh, encrypted token persistence, and ESI sync authorization are larger future slices.

**Alternatives considered**:

- Store access/refresh tokens in MongoDB now: rejected because token lifecycle, revocation, and refresh policy need their own plan.
- Store tokens in browser storage: rejected by constitution and EVE SSO security expectations.

## Decision: Preserve env fallback for local development and tests

**Rationale**: M1-M5 quickstarts and test fixtures rely on deterministic corporation scope. Authenticated session scope should take precedence when present, but local/test workflows must remain reliable without live SSO.

**Alternatives considered**:

- Require live EVE SSO for every command API: rejected because it would slow local development and make CI depend on external credentials.
