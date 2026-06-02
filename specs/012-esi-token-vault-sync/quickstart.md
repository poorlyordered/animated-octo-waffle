# Quickstart: ESI Token Vault Sync

## Prerequisites

- `MONGODB_URI` and `MONGODB_DB` for local function tests.
- `EVE_CLIENT_ID`, `EVE_CLIENT_SECRET`, and `EVE_REDIRECT_URI` for live callback behavior.
- `ESI_TOKEN_VAULT_SEALING_KEY` for production-style token sealing.
- Existing command session signing configuration from the EVE SSO scope feature.

## Manual Validation Flow

1. Start from an authenticated command session.
2. Open the command app and inspect ESI sync status.
3. Verify missing consent status lists read-only required scopes and does not expose tokens.
4. Start ESI read-sync consent.
5. Complete the EVE callback.
6. Verify active vault status shows character identity, corporation identity, granted scopes, consent timestamp, and no token material.
7. Prepare a Numbers sync request.
8. Verify the sync request is queued, has no fetched ESI payload, and says no worker was dispatched.
9. Prepare the same Numbers sync again.
10. Verify the existing sync request is surfaced instead of duplicated.
11. Revoke consent.
12. Verify the vault is revoked and future sync preparation is blocked.

## Validation Commands

Run from repository root:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Results

- `npm run lint`: Passed
- `npm run typecheck`: Passed
- `npm test`: Passed - 31 suites, 131 tests
- `npm run test:e2e`: Passed - 21 Chromium browser smoke tests
- `npm run build`: Passed
