# Quickstart: M49 Production Evidence Recorder

1. Run targeted tests:

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

3. Validate local API behavior with Netlify Dev and an isolated `MONGODB_DB`.

4. Do not paste provider secrets, connection strings, JWTs, cookies, raw logs, or production record exports into the evidence form.
