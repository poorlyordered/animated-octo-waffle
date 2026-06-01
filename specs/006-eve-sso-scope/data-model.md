# Data Model: EVE SSO Session Scope

## EveSessionScope

Server-owned session scope for command API authorization.

Fields:

- `characterId`: Authenticated EVE character identifier.
- `characterName`: Display-safe character name.
- `corporationId`: Corporation identifier resolved from authenticated identity.
- `corporationName`: Display-safe corporation name when known.
- `issuedAt`: ISO timestamp when the session scope was created.
- `expiresAt`: ISO timestamp when the session scope should no longer be accepted.
- `source`: `eve-sso`.

Validation rules:

- `characterId`, `characterName`, and `corporationId` are required.
- Expired session scopes are ignored.
- Session scope must be signed server-side before being accepted from a cookie.
- Tokens and client secrets are not part of this entity.

## EveSsoState

Short-lived anti-forgery state for a sign-in attempt.

Fields:

- `state`: Random opaque string sent to EVE SSO and expected in callback.
- `returnTo`: Local return path after successful sign-in.
- `issuedAt`: ISO timestamp.
- `expiresAt`: ISO timestamp.

Validation rules:

- Callback state must match the signed state cookie.
- Expired, missing, or replayed state is rejected.
- `returnTo` must be a local path, not an arbitrary external URL.

## SessionStateResponse

Browser-safe session state response.

Fields:

- `signedIn`: Boolean.
- `scopeSource`: `session`, `fallback`, or `missing`.
- `characterId`: Present only for authenticated session scope.
- `characterName`: Present only for authenticated session scope.
- `corporationId`: Present for session or fallback scope.
- `corporationName`: Present when known.
- `expiresAt`: Present only for authenticated session scope.

Validation rules:

- Response never includes access tokens, refresh tokens, client secrets, MongoDB credentials, or cookie signatures.
- Fallback state may include corporation ID but no character identity.

## ScopeResolutionResult

Internal result returned by auth scope resolution.

Fields:

- `corporationId`: Resolved corporation scope when available.
- `source`: `session` or `fallback`.
- `session`: Optional authenticated session metadata.

Validation rules:

- Session source takes precedence over fallback source.
- Missing scope throws a safe server error that maps to a non-secret API response.
