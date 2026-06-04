# Quickstart: Dedicated Opportunity Surface

## Manual Flow

1. Open the app.
2. Locate the Opportunity operating layer.
3. Verify it shows summary, strategic impacts, recommendations, watchlist, sources, provenance, and recent research history.
4. Verify no research scheduling, worker dispatch, ESI fetch, EVE write, or external execution controls are present.

## Validation

Completed on 2026-06-04:

```bash
npm run lint
npm run typecheck
npm test -- opportunity-surface command-brief-api opportunity-ingestion-history
npm test
npm run test:e2e
npm run build
```

Results:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test -- opportunity-surface command-brief-api opportunity-ingestion-history`: 3 suites, 7 tests passed
- `npm test`: 40 suites, 170 tests passed
- `npm run test:e2e`: 25 Playwright tests passed
- `npm run build`: passed
