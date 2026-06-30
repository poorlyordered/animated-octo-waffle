# Quickstart: M42 People Ingestion Expansion

## Local Validation

1. Run targeted People validation:

   ```bash
   npm test -- people-api people-ingestion-history
   ```

2. Run full validation:

   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run test:e2e
   npm run build
   git diff --check
   ```

## Manual Smoke

1. Open the People operating layer.
2. Confirm ingestion provenance shows current mode, source count, section coverage, and boundary language.
3. Click `Prepare ingestion`.
4. Confirm a queued request appears and the page states no worker was dispatched, no ESI data was fetched, and no role/access or external-service change occurred.
