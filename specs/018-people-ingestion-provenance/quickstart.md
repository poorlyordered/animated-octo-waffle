# Quickstart: People Ingestion Provenance

## Manual Smoke

1. Load the People operating layer.
2. Confirm the page shows member profiles and leadership follow-ups.
3. Confirm the ingestion provenance panel shows:
   - provenance mode
   - profile count
   - source count
   - identity, roles, activity, and delegation statuses
   - recent ingestion history when present
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
- `npm test -- people-api people-ingestion-history` passed on 2026-06-04: 2 suites, 6 tests.
- `npm test` passed on 2026-06-04: 38 suites, 159 tests.
- `npm run test:e2e` passed on 2026-06-04: 22 Playwright tests.
- `npm run build` passed on 2026-06-04.
