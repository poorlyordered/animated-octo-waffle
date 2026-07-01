# Quickstart: Codex Review Followups

## Targeted Validation

1. Run People follow-up regression tests:

   ```sh
   npm test -- people-followup
   ```

2. Run production evidence validation tests:

   ```sh
   npm test -- production-evidence
   ```

3. Run ESI sync history and worker tests:

   ```sh
   npm test -- esi-sync
   ```

## Full Quality Gate

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
git diff --check
```

Then perform the code-review-and-quality review across correctness, readability, architecture, security, performance, and verification.
