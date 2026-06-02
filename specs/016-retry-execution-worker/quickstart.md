# Quickstart: Retry Execution Worker

## Validation Targets

1. Seed failed worker handoff and scheduled retry.
2. Call `GET /api/retry-worker/ready` with trusted worker secret and verify due retry appears.
3. Call `POST /api/retry-worker/:id/execute` with `workerId`.
4. Verify retry is `completed` and a replacement ready handoff is linked.
5. Seed failed Numbers ESI sync and scheduled retry.
6. Execute retry and verify a replacement queued sync request is linked without ESI fetch or token refresh.
7. Seed blocked conditions for non-failed targets, missing consent, and future not-before timestamps.
8. Verify automation queue detail and ESI sync history display scheduled, claimed, completed, and blocked retry status without secrets.

## Local Commands

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Validation Results

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed, 37 suites and 156 tests
- `npm run test:e2e`: passed, 21 Chromium browser smoke tests
- `npm run build`: passed

## Expected Boundaries

- Browser command surfaces never execute retries.
- Retry worker endpoints require the worker callback secret.
- Handoff retries prepare replacement ready handoffs but do not dispatch or claim workers.
- ESI sync retries prepare replacement queued sync requests but do not refresh tokens or fetch ESI data.
- Responses exclude token material, worker secrets, raw ESI payloads, dispatch targets, and external execution handles.
