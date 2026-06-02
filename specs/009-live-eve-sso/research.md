# Research: Live EVE SSO

## Decision: Use the EVE authorization-code flow server-side

**Rationale**: Official EVE SSO documentation identifies authorization code as the web-application flow for apps that can keep a client secret server-side. The callback exchanges the one-time code with the token endpoint and then validates the access token before trusting identity.

**Alternatives considered**: PKCE-only flow was reviewed but is oriented toward native/mobile clients that cannot keep a secret. The existing Netlify callback is server-side, so the client-secret flow matches this app.

## Decision: Validate EVE access tokens through metadata-derived JWKS

**Rationale**: EVE states access tokens are JWTs signed by EVE SSO and should be validated by fetching metadata from `https://login.eveonline.com/.well-known/oauth-authorization-server`, then using its JWKS URI. Validation must check signature, accepted issuer, expiry, and audience containing both the app client ID and `EVE Online`.

**Alternatives considered**: The old verify endpoint path is deprecated. Blindly decoding the JWT would not prove the token was issued for this app.

## Decision: Keep token material transient in M9

**Rationale**: The feature goal is identity validation and command-session scope. Persisting refresh tokens creates a larger consent, revocation, vaulting, and ESI sync problem that should be designed as a separate explicit feature.

**Alternatives considered**: Storing refresh tokens now would enable future ESI reads sooner, but it would expand the security boundary beyond this milestone.

## Decision: Resolve corporation identity with read-only ESI lookups

**Rationale**: The validated JWT supplies character identity. The command session also needs corporation identity, so the adapter resolves the character record and corporation record through read-only ESI calls after JWT validation.

**Alternatives considered**: Keeping the previous environment fallback corporation after sign-in would allow a verified character to be associated with the wrong command scope.

## Decision: Preserve deterministic identity fixture as the local fast path

**Rationale**: Local validation, contract tests, and browser smoke tests must continue without live EVE credentials or network dependency. When `EVE_SSO_TEST_IDENTITY_JSON` is configured, callback behavior remains deterministic and produces the same command session shape as live validation.

**Alternatives considered**: Removing the fixture would force live credentials into routine local validation and slow the Spec Kit loop.

## Sources

- EVE Developer Documentation, Single Sign-On: https://developers.eveonline.com/docs/services/sso/
- ESI Docs, Validating JWT tokens from the EVE SSO: https://docs.esi.evetech.net/docs/sso/validating_eve_jwt.html
