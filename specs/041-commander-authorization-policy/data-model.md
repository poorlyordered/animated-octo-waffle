# Data Model: M41 Commander Authorization Policy

## Command Scope Resolution

- `corporationId`: authorized command corporation id
- `source`: `session` or `fallback`
- `session`: display-safe signed EVE identity when authorized

## Unauthorized Session State

- `signedIn`: false
- `scopeSource`: `unauthorized`
- `characterId`: display-safe character id from the rejected session
- `characterName`: display-safe character name from the rejected session
- `corporationId`: rejected session corporation id
- `corporationName`: rejected session corporation name
- `reason`: safe explanation for the browser

## Auth Scope Error

- `code`: stable error code for auth policy failures
- `statusCode`: HTTP status for command APIs
- `publicMessage`: safe response message
