# Quickstart: Decision Approval Workflow Improvements

## Manual Flow

1. Open the Numbers operating layer.
2. Record a decision from a Numbers follow-up candidate.
3. Approve the recorded decision with explicit approval text.
4. Verify the handoff says approved and queue-ready.
5. Verify queued work is not created until the separate `Create queued work` button is used.
6. Record another decision and reject it.
7. Verify the handoff says rejected and queue-blocked.

## Validation

Completed on 2026-06-04:

```bash
npm run lint
npm run typecheck
npm test -- numbers-api numbers-followup-actions
npm test
npm run test:e2e
npm run build
```

Results:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test -- numbers-api numbers-followup-actions`: 2 suites, 16 tests passed
- `npm test`: 39 suites, 168 tests passed
- `npm run test:e2e`: 24 Playwright tests passed
- `npm run build`: passed
