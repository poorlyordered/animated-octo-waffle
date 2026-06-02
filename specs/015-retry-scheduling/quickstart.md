# Quickstart: Retry Scheduling

## Manual Validation Flow

1. Seed a failed worker handoff and failed Numbers ESI sync request.
2. Schedule retry for each failed target.
3. Verify scheduled retry metadata appears next to the failed handoff and failed sync.
4. Verify duplicate scheduling surfaces the existing retry.
5. Verify ready/claimed/completed targets cannot schedule retry.
6. Verify no worker dispatch, retry execution, token refresh, ESI fetch, EVE write, wallet, asset, contract, role, or external mutation occurs.

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
- `npm test`: Passed - 36 suites, 146 tests
- `npm run test:e2e`: Passed - 21 Chromium browser smoke tests
- `npm run build`: Passed
