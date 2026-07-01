# Data Model: Auth Landing Gate

## Session Access State

Represents the browser-safe result of current command access evaluation.

Fields:

- `signedIn`: boolean indicating whether an authorized signed EVE session is active.
- `scopeSource`: one of `session`, `fallback`, `missing`, or `unauthorized`.
- `characterId`: optional browser-safe EVE character id for signed or unauthorized sessions.
- `characterName`: optional browser-safe EVE character name.
- `corporationId`: optional browser-safe corporation id.
- `corporationName`: optional browser-safe corporation name.
- `expiresAt`: optional session expiry timestamp for signed sessions.
- `reason`: optional safe explanation for missing or unauthorized access states.

Validation rules:

- Secret values, access tokens, refresh tokens, token hashes, cookies, MongoDB credentials, and worker secrets are never included.
- Production command access requires `signedIn=true` and `scopeSource=session`.
- A mismatched corporation session produces `scopeSource=unauthorized`, not fallback access.

## Landing Gate

Represents the unauthenticated first screen.

Fields/content:

- Product identity: `Gryyk-47`.
- Product role: corporation command operating system for EVE Online.
- EVE SSO sign-in action linked to server-owned sign-in start.
- Trust copy: EVE SSO is used; Gryyk-47 does not store EVE account passwords.
- Capability cues: Command Brief, Numbers, Opportunity, People.
- Access-state variant: loading, missing/no session, unauthorized corporation, session unavailable.

Validation rules:

- Must not render command data values.
- Must not start command data API requests.
- Must not include client-generated OAuth URL or token storage behavior.

## Command Shell

Represents the existing authenticated command surfaces as a single shell.

Included surfaces:

- Session status.
- Command brief.
- Opportunity.
- Numbers.
- Decision records.
- Automation queue.
- People.
- ESI sync.
- Operations health.
- Production evidence.

Validation rules:

- Renders only after authorized signed session state in production.
- Keeps existing no-execution and approval-boundary copy inside surfaces.
- Sign-out transitions back to the landing gate.
