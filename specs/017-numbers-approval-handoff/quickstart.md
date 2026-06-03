# Quickstart: Numbers Approval Handoff

## Validation Targets

1. Create or surface a Numbers follow-up decision.
2. Confirm the response includes approval handoff metadata for proposed decision state.
3. Create queued work from an approved Numbers follow-up decision.
4. Confirm the queue response includes linked decision and queue item ids.
5. Confirm duplicate decision and queue responses include the same handoff metadata.
6. Confirm browser copy distinguishes approval handoff and queued work from execution.

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
- `npm test`: passed, 37 suites and 157 tests
- `npm run test:e2e`: passed, 22 Chromium browser smoke tests
- `npm run build`: passed
