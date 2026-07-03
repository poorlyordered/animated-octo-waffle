# Quickstart: Intelligence Refresh Runs

## Prerequisites

- Local dependencies installed with `npm install`.
- Netlify functions run through `npm run dev:netlify` for manual API validation.
- Server environment includes:
  - `MONGODB_URI`
  - `MONGODB_DB`
  - `EVEONLINE_CORPORATION_ID`
  - `EVE_SESSION_SECRET`
  - `WORKER_CALLBACK_SECRET` or class-specific worker secrets
  - `OPENROUTER_API_KEY` only when running live Brain evaluation
- Browser validation uses deterministic fixtures and must not require live EVE, MongoDB, or OpenRouter credentials.

## Validation Flow

1. Create a signed session or deterministic test session for the authorized corporation.
2. Open the command center and confirm the Intelligence Refresh panel shows recent runs or an empty state.
3. Create a refresh run for `numbers`, `opportunity`, and `people`.
4. Confirm the response contains a queued or prepared run summary and does not contain token material, secrets, raw ESI payloads, raw prompts, dispatch targets, or mutation fields.
5. Use worker-authenticated requests to claim and complete one domain step.
6. Use worker-authenticated requests to fail or skip another domain step.
7. Confirm the browser-visible run detail shows partial status, safe failure reasons, and evaluation readiness.
8. Trigger Brain evaluation through the trusted worker path with partial evaluation allowed.
9. Confirm the run links to a Brain run and generated command brief or records a safe evaluation failure.
10. Confirm command surfaces still preserve approval boundaries: no EVE writes, role/access changes, wallet/asset/contract movement, worker dispatch, retry execution, or external-service mutation occurs from the browser request path.

## Automated Checks

Run focused checks first:

```sh
npm test -- intelligence-refresh
```

Then run the standard quality gate before merge:

```sh
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
git diff --check
```
