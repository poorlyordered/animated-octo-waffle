# Quickstart: Worker Handoff For Automation Queue

## Prerequisites

- Local dependencies are installed.
- `MONGODB_URI`, `MONGODB_DB`, and `EVEONLINE_CORPORATION_ID` are configured server-side for local API validation.
- A queued automation record exists for the active corporation scope.
- Player-impacting queue records include explicit approval metadata before handoff preparation.

## Validation Flow

1. Run fast contract/unit validation:

   ```bash
   npm test
   ```

2. Run browser smoke validation:

   ```bash
   npm run test:e2e
   ```

3. Run production build:

   ```bash
   npm run build
   ```

4. Confirm handoff preparation:
   - Use an eligible queued automation record.
   - Request `POST /api/automation-queue/:queueItemId/handoff`.
   - Confirm the response contains a `ready` handoff linked to the queue item.
   - Confirm no response field includes secrets, tokens, credentials, cookie signatures, or external dispatch targets.

5. Confirm idempotency:
   - Repeat the same handoff preparation request.
   - Confirm the existing active handoff is returned and no duplicate active handoff is created.

6. Confirm approval boundary:
   - Use a player-impacting queue item without approval metadata.
   - Confirm handoff preparation is rejected and no handoff record is created.

7. Confirm inspectability:
   - Request the automation queue detail and handoff list.
   - Confirm handoff status, timestamps, payload summary, and safe failure information are visible.

## Expected Result

Gryyk-47 can prepare approved queued work for future worker pickup through durable, scoped, auditable handoff records while keeping actual worker dispatch, retries, EVE writes, and long-running processing outside Netlify request paths.

## Validation Results

- `npm run lint`: PASS on 2026-06-01.
- `npm run typecheck`: PASS on 2026-06-01.
- `npm test`: PASS on 2026-06-01, 23 suites and 82 tests.
- `npm run test:e2e`: PASS on 2026-06-01 with elevated local server permissions, 12 browser tests.
- `npm run build`: PASS on 2026-06-01.
