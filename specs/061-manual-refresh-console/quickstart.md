# Quickstart: Manual Refresh Console

## Local Validation

1. Install dependencies if needed:

```sh
npm install
```

2. Run focused tests while developing:

```sh
npm test -- intelligence-refresh
```

3. Run browser smoke for refresh console behavior:

```sh
npm run test:e2e -- --grep "intelligence refresh"
```

4. Run the full quality gate before review:

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
git diff --check
```

5. Run the code review quality gate:

```sh
# Use the code-review-and-quality skill against the completed diff.
```

## Manual Smoke Scenario

1. Sign in with an authorized EVE SSO session.
2. Open the command board.
3. Navigate to Refresh.
4. Confirm the readiness checklist shows:
   - signed session
   - authorized corporation
   - ESI vault/scope state
   - worker callback configuration
   - model provider configuration
   - storage access
5. Select `Full refresh`.
6. Select Numbers, Opportunity, and People.
7. Create the run.
8. Confirm the run appears in the timeline with specific labels such as `Waiting for worker` or `Blocked: ESI authorization required`.
9. Open run detail and verify event log entries for readiness/run creation.
10. For a failed fixture step, schedule retry intent and confirm no worker dispatch or execution language appears.
11. Confirm command board labels use specific state text rather than generic `processing`.

## Expected Boundaries

- Browser actions create durable records only.
- ESI data fetches remain worker-owned.
- Brain/OpenRouter calls remain server/worker-owned.
- Retry actions record intent only.
- Skip actions record commander intent and missing-output consequences.
- No raw token/provider/ESI payloads appear in browser responses.
