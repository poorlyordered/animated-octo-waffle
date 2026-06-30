# Quickstart: M51 People ESI Worker Planning

1. Run targeted validation:

   ```bash
   npm test -- esi-sync
   ```

2. Run full validation before PR:

   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run test:e2e
   npm run build
   git diff --check
   ```

3. Confirm worker boundaries:

   - `numbers`: list, claim, run, fail
   - `people`: list, claim, complete, fail
   - `opportunity`: planning-only in this slice
