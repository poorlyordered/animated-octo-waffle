# Contract: Live EVE SSO

## GET /api/eve-sso-start

Starts the existing EVE authorization flow.

### Inputs

- Optional query parameter `returnTo`: local return path only.

### Success

- `302` redirect to the EVE SSO authorization endpoint.
- Sets signed transient SSO state cookie.

### Failure

- `400` when `returnTo` is external or unsafe.
- `500` safe error when required public SSO start configuration is unavailable.

## GET /api/eve-sso-callback

Completes EVE SSO sign-in.

### Inputs

- Query parameter `code`: authorization code returned by EVE SSO.
- Query parameter `state`: anti-forgery state returned by EVE SSO.
- Signed transient SSO state cookie.

### Live Success

- Validates callback state.
- Exchanges `code` server-side for EVE token material.
- Validates access-token signature, issuer, expiry, and audience.
- Resolves character corporation identity through read-only ESI lookup.
- Sets signed HTTP-only command session cookie containing only browser-safe command scope.
- Clears transient SSO state cookie.
- Returns `302` redirect to the validated local return path.

### Deterministic Fixture Success

- When deterministic identity fixture is configured, validates callback state and creates the same command session scope shape without contacting EVE services.

### Failure

- `400` for missing or invalid callback values/state.
- `500` safe error for live exchange, token validation, or identity lookup failure.
- Always clears transient SSO state on callback failure.
- Never returns EVE access tokens, refresh tokens, client secrets, or raw provider payloads.

## GET /api/eve-session

Returns browser-safe command session state.

### Success

- `scopeSource: "session"` for signed-in sessions.
- Includes character and corporation display identity.
- Excludes EVE access tokens, refresh tokens, client secrets, and raw JWT claims.

## POST /api/eve-session/sign-out

Clears the Gryyk-47 command session cookie.

### Success

- Returns browser-safe fallback or missing scope state.
- Does not call EVE and does not revoke EVE tokens in this slice.
