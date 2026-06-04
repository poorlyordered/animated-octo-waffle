# Quickstart: Opportunity Ingestion Provenance

## Manual Smoke

1. Load the command brief surface.
2. Confirm the page shows the command brief executive summary and operating leg coverage.
3. Confirm the Opportunity provenance panel shows:
   - provenance mode
   - research focus
   - brief count
   - source count
   - sources, impacts, recommendations, and watchlist statuses
   - recent research history when present
   - no-execution language

## Local Validation

Run from repo root:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Validation Results

- `npm run lint` passed on 2026-06-04.
- `npm run typecheck` passed on 2026-06-04.
- `npm test -- command-brief-api opportunity-ingestion-history` passed on 2026-06-04: 2 suites, 5 tests.
- `npm test` passed on 2026-06-04: 39 suites, 161 tests.
- `npm run test:e2e` passed on 2026-06-04: 22 Playwright tests.
- `npm run build` passed on 2026-06-04.
