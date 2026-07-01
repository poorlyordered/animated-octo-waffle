# Contract: Auth Landing Gate

## Browser Session Contract

The app shell loads current session state from:

```http
GET /api/eve-session
```

Expected gate behavior:

- `signedIn=true` and `scopeSource=session`: render command shell.
- `scopeSource=fallback`: render landing gate in production; local/test behavior may render command shell only when explicit fallback is allowed.
- `scopeSource=missing`: render landing gate with sign-in action.
- `scopeSource=unauthorized`: render unauthorized corporation state with sign-out/retry action.

## Sign-In Contract

The landing gate sign-in action links to:

```http
GET /api/eve-sso-start
```

The browser does not construct the OAuth URL and does not store OAuth tokens.

## Sign-Out Contract

The authenticated shell and unauthorized state use:

```http
POST /api/eve-session/sign-out
```

Expected response is the browser-safe session state after clearing the session cookie.

## Command API Authorization Contract

Production command data APIs require an authorized signed session:

```http
GET /api/command-brief
GET /api/research-status
GET /api/numbers
GET /api/decision-records
GET /api/automation-queue
GET /api/people/members
GET /api/people/follow-ups
GET /api/production-evidence
GET /api/esi-sync/status
GET /api/operations-health
```

No-session production response:

```json
{
  "error": "Signed EVE session is required"
}
```

Status: `401 Unauthorized`

Unauthorized corporation response remains:

```json
{
  "error": "Signed EVE session is not authorized for this corporation"
}
```

Status: `403 Forbidden`

Non-production/test fallback:

- Existing fallback response behavior may remain available when explicitly configured outside production.
- Browser-controlled corporation id headers, query values, and request bodies remain ignored.
