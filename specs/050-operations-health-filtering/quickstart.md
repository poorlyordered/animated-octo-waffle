# Quickstart: M50 Operations Health Filtering

1. Run targeted validation:

   ```bash
   npm test -- operations-health
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

3. In the browser, open Operations Health and verify warning severity, worker status, and secret state filters update visible rows and counts without adding execution controls.
