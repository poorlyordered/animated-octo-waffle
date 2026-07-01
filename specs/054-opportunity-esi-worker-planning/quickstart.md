# Quickstart: M54 Opportunity ESI Worker Planning

1. Run targeted validation:

   ```bash
   npm test -- esi-sync
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

3. Verify worker domain boundaries:

   - `numbers`: list, claim, run, fail
   - `people`: list, claim, complete, fail
   - `opportunity`: list, claim, complete, fail

4. Confirm browser paths still do not fetch ESI, dispatch workers, write to EVE, mutate roles/access/standings, move wallets/assets/contracts, or call external services.
