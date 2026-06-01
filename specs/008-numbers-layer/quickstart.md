# Quickstart: Numbers Operating Layer

## Prerequisites

- Local dependencies are installed.
- `MONGODB_URI`, `MONGODB_DB`, and `EVEONLINE_CORPORATION_ID` are configured server-side for local API validation.
- Processed numbers data is available in `numbers_snapshots` for live local API validation.
- Browser smoke tests use deterministic fixtures and do not require live MongoDB or EVE credentials.

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

4. Confirm scoped numbers read:
   - Request `/api/numbers` with the configured corporation scope.
   - Confirm the response returns the latest processed `numbers_snapshots` record for that scope or `snapshot: null`.

5. Confirm stale/missing behavior:
   - Use a partial processed snapshot.
   - Confirm absent wallet/assets/logistics/market/activity sections are represented as explicit missing states.
   - Confirm stale sections include stale reasons.

6. Confirm read-only boundary:
   - Attempt browser-controlled corporation/action-like inputs.
   - Confirm response scope does not change and no wallet, asset, worker, EVE, or external action occurs.

## Expected Result

Gryyk-47 shows a read-only Numbers operating surface with wallet, assets, logistics, market, and activity health, provenance, missing/stale data indicators, and display-only follow-up candidates.

## Validation Results

- `npm run lint`: PASS on 2026-06-01.
- `npm run typecheck`: PASS on 2026-06-01.
- `npm test`: PASS on 2026-06-01, 25 suites and 89 tests.
- `npm run test:e2e`: PASS on 2026-06-01 with elevated local server permissions, 16 browser tests.
- `npm run build`: PASS on 2026-06-01.
