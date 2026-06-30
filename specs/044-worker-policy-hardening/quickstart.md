# Quickstart: M44 Worker Policy Hardening

## Local Validation

1. Run targeted worker auth validation:

   ```bash
   npm test -- worker-callback-auth
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

## Operator Smoke

1. Configure only `WORKER_CALLBACK_SECRET` and verify existing worker callbacks remain authorized.
2. Configure a class-specific secret such as `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET`.
3. Verify the People ingestion worker accepts the class-specific secret and rejects a different class secret.
