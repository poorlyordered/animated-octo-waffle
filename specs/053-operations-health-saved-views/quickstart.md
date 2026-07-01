# Quickstart: M53 Operations Health Saved Views

1. Run targeted validation:

   ```bash
   npm test -- operations-health
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

3. In the browser, open Operations Health and verify saved views can save, apply, and delete the current warning severity, worker status, and secret-state filters.

4. Confirm no `/api/operations-health` request shape changes, server preference storage, provider calls, worker dispatch, retry execution, ESI fetch, EVE write, or external-service mutation were added.
