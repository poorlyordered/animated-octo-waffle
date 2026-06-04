# Quickstart: Decision List Filters

## Manual Flow

1. Open the app.
2. Locate the Decision loop.
3. Verify decision counts are visible.
4. Filter by status.
5. Filter by source.
6. Select a visible decision and verify detail/status workflows remain unchanged.
7. Verify no approval, queue, worker, retry, ESI, EVE, or external execution occurs from filtering.

## Validation

Completed on 2026-06-04:

```bash
npm run lint
npm run typecheck
npm test -- decision-list-filters decision-record-api
npm test
npm run test:e2e
npm run build
```

Results:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test -- decision-list-filters decision-record-api`: 2 suites, 7 tests passed
- `npm test`: 41 suites, 175 tests passed
- `npm run test:e2e`: 27 Playwright tests passed
- `npm run build`: passed
