# Contract: ESI Token Vault Sync API

All responses are browser-safe and must omit access tokens, refresh tokens, token hashes, sealing keys, OAuth client secrets, cookie signatures, MongoDB credentials, worker secrets, dispatch targets, retry schedules, and external execution handles.

## GET /api/esi-sync/status

Returns vault and sync preparation status for the active command scope.

### Response 200

```json
{
  "vault": {
    "status": "missing",
    "character": null,
    "corporation": null,
    "grantedScopes": [],
    "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"],
    "consentedAt": null,
    "revokedAt": null,
    "lastSync": null,
    "boundaries": ["Explicit ESI consent is required before read sync can be prepared."]
  },
  "domains": [
    {
      "domain": "numbers",
      "label": "Numbers",
      "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"],
      "available": false,
      "missingScopes": ["esi-wallet.read_corporation_wallets.v1"]
    }
  ]
}
```

## POST /api/esi-sync/consent/start

Starts read-sync consent and returns the EVE authorization target. The server chooses scopes and state.

### Request

```json
{
  "returnTo": "/"
}
```

Browser-provided `scopes`, `tokens`, `corporationId`, `characterId`, `dispatch`, `retry`, `walletAction`, `assetAction`, `contractAction`, `roleChange`, or execution fields are rejected or ignored.

### Response 200

```json
{
  "authorizationUrl": "https://login.eveonline.com/v2/oauth/authorize?...",
  "requestedScopes": ["esi-wallet.read_corporation_wallets.v1"],
  "stateExpiresAt": "2026-06-02T12:10:00.000Z",
  "boundary": "No token has been stored. Vaulting occurs only after a valid EVE callback."
}
```

## GET /api/eve-sso-callback?code=...&state=...

Completes the existing EVE SSO callback. When the callback state is for ESI read-sync consent, the server validates token identity and scopes, seals token material, and updates vault status.

### Response

Redirects to the command app with a safe success or failure indicator. No token material appears in the URL.

## POST /api/esi-sync/revoke

Revokes the active vault for the active command scope.

### Request

```json
{
  "reason": "Commander revoked read sync consent"
}
```

### Response 200

```json
{
  "vault": {
    "status": "revoked",
    "character": {
      "id": "2112625428",
      "name": "Commander"
    },
    "corporation": {
      "id": "987654321",
      "name": "Gryyk-47"
    },
    "grantedScopes": [],
    "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"],
    "consentedAt": "2026-06-02T12:00:00.000Z",
    "revokedAt": "2026-06-02T12:30:00.000Z",
    "lastSync": null,
    "boundaries": ["Revoked token material cannot prepare sync requests."]
  }
}
```

## POST /api/esi-sync/prepare

Creates or surfaces a queued read-sync request for a supported domain.

### Request

```json
{
  "domain": "numbers"
}
```

### Response 201

```json
{
  "syncRequest": {
    "id": "sync_01",
    "domain": "numbers",
    "status": "queued",
    "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"],
    "requestedAt": "2026-06-02T12:45:00.000Z",
    "boundary": "Queued for future read-only worker sync. No ESI data was fetched and no worker was dispatched."
  },
  "duplicate": false
}
```

### Response 200 Duplicate

```json
{
  "syncRequest": {
    "id": "sync_01",
    "domain": "numbers",
    "status": "queued",
    "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"],
    "requestedAt": "2026-06-02T12:45:00.000Z",
    "boundary": "Existing queued sync request surfaced. No duplicate was created."
  },
  "duplicate": true
}
```

### Response 409 Missing Consent Or Scope

```json
{
  "error": "missing_scope",
  "message": "Read sync requires additional ESI consent.",
  "missingScopes": ["esi-wallet.read_corporation_wallets.v1"],
  "boundary": "No sync request was created."
}
```
