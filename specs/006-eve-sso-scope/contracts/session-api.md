# Contract: EVE Session API

## GET `/api/eve-session`

Returns browser-safe session state.

Response when signed in:

```json
{
  "signedIn": true,
  "scopeSource": "session",
  "characterId": "2110000001",
  "characterName": "Ari Voss",
  "corporationId": "917701062",
  "corporationName": "Gryyk-47",
  "expiresAt": "2026-06-02T00:00:00.000Z"
}
```

Response when using fallback scope:

```json
{
  "signedIn": false,
  "scopeSource": "fallback",
  "corporationId": "917701062"
}
```

Response when missing scope:

```json
{
  "signedIn": false,
  "scopeSource": "missing"
}
```

The response must never include tokens, secrets, cookie signatures, or MongoDB credentials.

## GET `/api/eve-sso-start`

Starts EVE SSO sign-in.

Behavior:

- Creates a signed, short-lived state cookie.
- Redirects to the EVE SSO authorization endpoint.
- Uses only server-side configured client ID, redirect URI, and scopes.
- Rejects non-local `returnTo` values.

Error behavior:

- Returns a safe error when required SSO server configuration is missing.

## GET `/api/eve-sso-callback`

Completes EVE SSO sign-in.

Required query values:

- `code`
- `state`

Behavior:

- Validates callback state against the signed state cookie.
- Exchanges the authorization code server-side.
- Validates returned identity before creating session scope.
- Creates a signed, HTTP-only session cookie containing display-safe session scope.
- Clears the one-time SSO state cookie.
- Redirects to the local return path.

Error behavior:

- Missing, invalid, expired, or replayed state fails safely.
- Token exchange or identity validation failure clears temporary state and returns a safe error.

## POST `/api/eve-session/sign-out`

Signs out.

Behavior:

- Clears the session cookie.
- Returns `{ "signedIn": false, "scopeSource": "fallback" }` if fallback is configured, otherwise `{ "signedIn": false, "scopeSource": "missing" }`.

The endpoint is idempotent; signing out with no active session is safe.
