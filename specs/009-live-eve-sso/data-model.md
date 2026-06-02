# Data Model: Live EVE SSO

## EVE SSO Configuration

Server-side configuration required to perform live validation.

- `clientId`: Public EVE application client identifier.
- `clientSecret`: Server-only EVE application secret for authorization-code exchange.
- `redirectUri`: Registered callback URI.
- `scopes`: Requested ESI scopes; defaults to `publicData`.
- `metadataUrl`: EVE SSO metadata endpoint; default is official Tranquility metadata.
- `tokenUrl`: Token endpoint for authorization-code exchange, with official default and local test override support.
- `esiBaseUrl`: ESI base URL for read-only identity lookup.

Validation rules:

- `clientId`, `clientSecret`, and `redirectUri` are required for live callback validation.
- Secret values must never be returned to browser-safe APIs or written into command session payloads.

## EVE Token Exchange Result

Transient token material returned by EVE SSO.

- `accessToken`: JWT access token used for identity validation and optional authenticated ESI request headers.
- `refreshToken`: Long-lived refresh token returned by EVE SSO; not persisted or exposed in M9.
- `tokenType`: Expected bearer token type.
- `expiresIn`: Token lifetime in seconds.

Validation rules:

- `accessToken` is required.
- Token material is kept in callback scope only and discarded after command session creation.

## Validated EVE Identity Claims

Trusted identity derived from the verified access token.

- `characterId`: Character identifier extracted from the EVE JWT subject.
- `characterName`: Character display name from the EVE JWT claims.
- `audience`: Token audience values used to confirm the token is intended for this app and EVE Online.
- `issuer`: Token issuer checked against accepted EVE issuer values.
- `expiresAt`: Access-token expiry derived from the JWT.

Validation rules:

- Signature must validate against the selected JWKS public key.
- Issuer must be an accepted EVE SSO issuer.
- Audience must contain both the configured app client ID and `EVE Online`.
- Expiry must be in the future.
- Subject must match a character identity pattern.

## EVE Corporation Identity

Read-only corporation identity resolved for the authenticated character.

- `corporationId`: Corporation identifier from ESI character lookup.
- `corporationName`: Corporation display name from ESI corporation lookup.

Validation rules:

- Both corporation identifier and name are required before creating signed command session scope.

## Command Session Scope

Existing browser-safe Gryyk-47 session payload.

- `characterId`
- `characterName`
- `corporationId`
- `corporationName`
- `issuedAt`
- `expiresAt`
- `source`

Validation rules:

- Shape must remain compatible with existing session contract.
- Must not include EVE access tokens, refresh tokens, client secrets, or raw JWT claims.
