# Quickstart: Opportunity Decision Handoff

## Manual Flow

1. Open the app.
2. Locate the Opportunity operating layer.
3. Select `Record decision` on an Opportunity recommendation.
4. Enter rationale and expected result.
5. Submit.
6. Verify a proposed decision and Opportunity handoff summary render.
7. Verify the surface does not approve, queue, schedule research, dispatch workers, fetch ESI, write to EVE, or execute external services.

## Validation

Completed on 2026-06-04:

```bash
npm run lint
npm run typecheck
npm test -- opportunity-surface command-brief-api decision-record-api
npm test
npm run test:e2e
npm run build
```

Results:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test -- opportunity-surface command-brief-api decision-record-api`: 3 suites, 11 tests passed
- `npm test`: 40 suites, 172 tests passed
- `npm run test:e2e`: 26 Playwright tests passed
- `npm run build`: passed
