# Data Model: ESI Token Vault Sync

## EsiTokenVault

Represents explicit commander consent and sealed ESI token material for one character and corporation scope.

### Fields

- `id`: Stable server-generated identifier.
- `corporationId`: Server-resolved corporation scope.
- `characterId`: EVE character identity validated by SSO.
- `characterName`: Browser-safe display identity.
- `corporationName`: Browser-safe display identity when available.
- `grantedScopes`: Read-only ESI scopes granted by the commander.
- `requestedScopes`: Read-only ESI scopes requested by Gryyk-47.
- `sealedAccessToken`: Server-sealed token payload, never returned to browser clients.
- `sealedRefreshToken`: Server-sealed token payload, never returned to browser clients.
- `accessTokenExpiresAt`: Expiry timestamp for the current access token.
- `consentedAt`: Timestamp when the vault was created or renewed.
- `revokedAt`: Timestamp when the commander revoked consent, if any.
- `status`: `active`, `revoked`, or `unavailable`.
- `lastSyncRequestId`: Most recent sync request derived from this vault, if any.
- `lastSyncRequestedAt`: Timestamp of most recent sync preparation, if any.
- `createdAt`: Persistence timestamp.
- `updatedAt`: Last mutation timestamp.

### Validation Rules

- `corporationId` and `characterId` are server-derived and cannot be browser-supplied.
- `grantedScopes` must include only configured read-only scopes.
- `sealedAccessToken` and `sealedRefreshToken` must never be serialized in browser-safe responses.
- A revoked vault cannot prepare new sync requests.

## EsiConsentScopeSet

Represents configured read-only scope requirements for supported sync domains.

### Fields

- `domain`: Sync domain such as `numbers`, `people`, or `opportunity`.
- `requiredScopes`: Read-only ESI scopes required for the domain.
- `label`: Commander-visible domain label.
- `description`: Commander-visible explanation of what the domain enables.

### Validation Rules

- Scope sets are server-owned configuration.
- Browser clients can request a domain, but cannot override required scopes.

## EsiSyncRequest

Represents a queued read-only sync request for future workers.

### Fields

- `id`: Stable server-generated identifier.
- `corporationId`: Server-resolved corporation scope.
- `characterId`: Character identity tied to the originating vault.
- `vaultId`: Originating active vault reference.
- `domain`: Requested sync domain.
- `requiredScopes`: Required scopes for the domain at creation time.
- `status`: `queued`, `claimed`, `completed`, `failed`, or `cancelled`.
- `requestedBy`: Browser-safe commander identity summary.
- `requestedAt`: Timestamp when the commander prepared sync.
- `completedAt`: Completion timestamp for future worker use.
- `failure`: Failure summary for future worker use.
- `source`: Provenance summary stating this was commander-prepared from explicit ESI consent.
- `createdAt`: Persistence timestamp.
- `updatedAt`: Last mutation timestamp.

### Validation Rules

- M12 creates only `queued` sync requests.
- M12 does not store fetched ESI payloads on sync requests.
- Active or queued duplicate requests for the same corporation, domain, and vault are surfaced instead of recreated.

## EsiVaultAuditEvent

Represents an inspectable audit event for vault and sync preparation activity.

### Fields

- `id`: Stable server-generated identifier.
- `corporationId`: Server-resolved corporation scope.
- `characterId`: Character identity when available.
- `vaultId`: Related vault, if any.
- `syncRequestId`: Related sync request, if any.
- `eventType`: `consent_started`, `vault_created`, `vault_revoked`, `sync_prepared`, `sync_duplicate`, `sync_blocked`, or `unsafe_request_blocked`.
- `summary`: Browser-safe event description.
- `createdAt`: Event timestamp.

### Validation Rules

- Audit events must not include token material, secrets, raw provider payloads, or external execution handles.
- Unsafe browser requests may create only safe audit summaries, not mutations with token or execution data.

## State Transitions

### Vault

```text
missing -> active -> revoked
missing -> unavailable
active -> unavailable
revoked -> active (only through a fresh consent callback)
```

### Sync Request

```text
queued -> claimed -> completed
queued -> claimed -> failed
queued -> cancelled
```

M12 creates only `queued`; later worker slices own the remaining transitions.
