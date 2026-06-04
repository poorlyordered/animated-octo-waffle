# Quickstart: Retry Cancellation and Policy Controls

## Manual Smoke

1. Load the automation queue surface.
2. Select a failed handoff with retry metadata.
3. Confirm retry policy text is visible.
4. Click `Cancel retry`.
5. Confirm the browser says the retry was canceled and no execution occurred.
6. Load the ESI sync surface and repeat for a failed or blocked sync retry.

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
- `npm test -- retry-worker-api retry-request-store` passed on 2026-06-04: 2 suites, 12 tests.
- `npm test` passed on 2026-06-04: 39 suites, 163 tests.
- `npm run test:e2e` passed on 2026-06-04: 22 Playwright tests.
- `npm run build` passed on 2026-06-04.
