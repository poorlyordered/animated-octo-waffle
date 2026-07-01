# Quickstart: M52 Production Evidence Filtering

1. Run targeted validation:

   ```bash
   npm test -- production-evidence
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

3. In the browser, open Production Evidence and verify environment, decision, and check-status filters update visible rows and counts without export, deploy, or rollback controls.
