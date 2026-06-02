# Quickstart: Worker Numbers ESI Ingestion

## Prerequisites

- M12 ESI token vault sync branch or merge.
- `MONGODB_URI`, `MONGODB_DB`, `WORKER_CALLBACK_SECRET`, and `ESI_TOKEN_VAULT_SEALING_KEY`.
- A queued Numbers `esi_sync_requests` record with an active same-corporation `esi_token_vaults` record.

## Manual Validation Flow

1. Prepare a Numbers read-sync request through the M12 ESI vault surface.
2. Call the worker ready route with `x-worker-callback-secret`.
3. Claim or run the queued request with a worker id.
4. Verify a processed `numbers_snapshots` record is written.
5. Verify the sync request is completed with snapshot linkage.
6. Verify browser-visible ESI vault status shows safe last-sync metadata only.

## Validation Commands

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
- `npm test`: Passed - 34 suites, 139 tests
- `npm run test:e2e`: Passed - 21 Chromium browser smoke tests
- `npm run build`: Passed
