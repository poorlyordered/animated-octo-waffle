# Quickstart: M43 Opportunity Ingestion Expansion

## Local Validation

1. Run targeted Opportunity validation:

   ```bash
   npm test -- command-brief-api opportunity-ingestion-history opportunity-surface
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

1. Open the Opportunity operating layer.
2. Confirm Opportunity provenance shows current mode, focus, source count, section coverage, and boundary language.
3. Click `Prepare ingestion`.
4. Confirm a queued request appears and the page states no research pull was scheduled, no worker was dispatched, no ESI data was fetched, no EVE write occurred, and no external service was executed.
