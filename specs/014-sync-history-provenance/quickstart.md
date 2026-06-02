# Quickstart: Sync History Provenance

## Prerequisites

- Existing local development environment from earlier Gryyk-47 slices.
- `MONGODB_URI` and `MONGODB_DB` for function tests.
- Existing command session scope configuration.
- M13 worker Numbers ingestion records or deterministic fixtures for local validation.

## Manual Validation Flow

1. Start from an authenticated or fallback command scope.
2. Seed recent Numbers ESI sync requests: queued, claimed, completed, failed, and partial completed.
3. Seed a Numbers snapshot linked to the completed sync request.
4. Open the Numbers surface.
5. Verify latest live provenance shows sync id, completion timestamp, source count, section health, snapshot timestamp, and read-only boundary language.
6. Open ESI sync settings.
7. Verify recent sync history is scoped, newest-first, status-rich, and browser-safe.
8. Verify failed and partial sync entries show safe reasons without raw ESI payloads.
9. Verify no retry, dispatch, EVE write, wallet, asset, contract, role, or external mutation controls appear.

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
- `npm test`: Passed - 35 suites, 142 tests
- `npm run test:e2e`: Passed - 21 Chromium browser smoke tests
- `npm run build`: Passed
