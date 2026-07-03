# Production Operations Runbook

Last reviewed: 2026-07-03

This runbook converts the production-readiness gaps into an operator checklist. It does not authorize a live deploy by itself and must not contain secret values, access tokens, connection strings, callback secrets, OAuth secrets, sealing keys, or production data exports.

## Operating Boundary

Production operations may verify configuration, run local validation, inspect provider settings, record evidence, deploy through an approved Netlify flow, monitor health, and roll back to a prior deploy. They must not add browser/request-path execution, dispatch workers from the browser, fetch ESI outside scoped read flows, write to EVE, move wallets/assets/contracts, change roles/access/standings, or mutate external services without a separately specified and approved feature.

## Pre-Deploy Evidence Checklist

Record evidence before a controlled staging or production deploy:

- Local validation: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, and `git diff --check` pass from the repo root.
- Git state: deploy commit SHA, branch, PR URL, and merge status are recorded.
- Netlify build shape: Node runtime is `22.x`, build command is `npm run build`, publish directory is `apps/web/dist`, functions directory is `netlify/functions`, and `/api/*` routes to `/.netlify/functions/:splat`.
- Environment inventory: required, production-required, optional, and test-only variables are checked by name only.
- No-secret evidence: screenshots, notes, logs, and PR comments omit secret values and token material.
- Rollback target: previous known-good Netlify deploy id or commit is recorded before promotion.

## Netlify Environment Verification

Verify in the Netlify project settings before deploy:

- `MONGODB_URI` is configured server-side and starts with `mongodb://` or `mongodb+srv://`.
- `MONGODB_DB` names the intended production database.
- `EVEONLINE_CORPORATION_ID` matches the fallback/default corporation scope intended for command APIs.
- `EVEONLINE_AUTHORIZED_CORPORATION_IDS` includes any additional EVE corporation IDs allowed to sign in through EVE SSO.
- `EVE_SESSION_SECRET` is configured; `GRYYK_SESSION_SECRET` should remain legacy-only.
- `ESI_TOKEN_VAULT_SEALING_KEY` is configured for production token vault sealing.
- `WORKER_CALLBACK_SECRET` is configured as fallback while worker classes migrate.
- Class-specific worker secrets are configured for each production worker class that will call back: `WORKER_HANDOFF_CALLBACK_SECRET`, `RETRY_WORKER_CALLBACK_SECRET`, `ESI_SYNC_WORKER_CALLBACK_SECRET`, `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET`, `OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET`, `BRAIN_WORKER_CALLBACK_SECRET`, and `INTELLIGENCE_REFRESH_WORKER_CALLBACK_SECRET`.
- `OPENROUTER_API_KEY` is configured server-side for trusted Brain worker calls.
- Optional Brain provider values are configured only when needed: `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_APP_URL`, `OPENROUTER_APP_TITLE`, `OPENROUTER_TIMEOUT_MS`, and `OPENROUTER_MAX_COMPLETION_TOKENS`.
- `EVE_SSO_CLIENT_ID`, `EVE_SSO_CLIENT_SECRET`, and `EVE_SSO_REDIRECT_URI` are configured for live EVE SSO.
- `EVE_SSO_TEST_IDENTITY_JSON` is absent from production.
- No server-only variable is exposed as `VITE_*`.
- No OpenRouter key, raw provider payload, prompt containing secrets, or unvalidated model output is stored in deploy evidence.

Evidence to keep: variable names present or absent, target environment name, reviewer, timestamp, and any provider check URL that does not expose values.

## EVE SSO Provider Verification

Verify against the live EVE SSO application before enabling production sign-in:

- The configured `EVE_SSO_REDIRECT_URI` exactly matches the deployed `/api/eve-sso-callback` URL.
- The app client id in the provider matches `EVE_SSO_CLIENT_ID`.
- The app does not expose the client secret in browser-visible configuration or documentation.
- Requested sign-in scope remains `publicData` unless a later approved feature expands it.
- ESI read-sync consent continues to request its own scoped read grants and stores token material server-side only.
- A signed-in session from the configured corporation can reach command APIs.
- A signed-in session from another corporation receives the safe unauthorized command scope and does not fall back to configured corporation data.

Evidence to keep: provider app name/id reference, callback URL string, scope list by name, and pass/fail notes for authorized and unauthorized session checks. Do not store access tokens, refresh tokens, JWTs, cookies, or client secrets.

## MongoDB Operations Verification

Verify with the production MongoDB owner before deploy:

- The production database named by `MONGODB_DB` is intentionally selected.
- The application user has least-privilege access for the collections used by the command loop.
- Backups are enabled and restore expectations are documented.
- Index posture is reviewed for command-loop collections, including `research_briefs`, `research_requests`, `numbers_snapshots`, `strategic_decisions`, `automation_queue`, `worker_handoffs`, `retry_requests`, `esi_token_vaults`, `esi_sync_requests`, `intelligence_refresh_runs`, `member_profiles`, `leadership_followups`, People ingestion history, and Opportunity ingestion history.
- Retention expectations are documented for audit/history collections before production data grows.
- Restore drills or provider restore evidence exist outside this repo before treating production data as durable.

Evidence to keep: database name, collection/index checklist outcome, backup policy summary, restore evidence reference, and least-privilege user confirmation. Do not store credentials, connection strings, raw production records, or token material.

## Monitoring And Alerting

Before production promotion, identify where operators will see:

- Netlify deploy/build failure alerts.
- Netlify function error and latency signals for `/api/*`.
- Browser/runtime error signals for command surfaces.
- MongoDB connection or query failure signals.
- EVE SSO callback failure signals.
- Worker callback authorization failures by worker class.
- Retry, ingestion, and worker handoff failure counts.

At minimum, record the monitoring owner, alert destination, severity threshold, and first-response expectation. If monitoring is not configured, keep production status as controlled/staging only.

## Worker Secret Rotation Posture

Use class-specific worker callback secrets wherever a production worker class exists:

- Rotate one worker class at a time.
- Configure the class-specific secret before rotating the worker.
- Verify the class-specific secret authorizes only that class.
- Keep `WORKER_CALLBACK_SECRET` only as fallback for classes not migrated yet.
- Remove or rotate the shared fallback after all production worker classes use class-specific secrets and an approved operations window confirms no fallback callers remain.

Evidence to keep: worker class, environment, rotation timestamp, verifier, and pass/fail status. Do not store secret values or hashes.

## Deploy And Smoke Verification

After an approved deploy:

- Confirm the deployed commit SHA matches the reviewed merge commit.
- Confirm the command center loads without browser console errors from app code.
- Confirm `/api/eve-session` returns browser-safe command scope data.
- Confirm command brief, Numbers, Opportunity, People, Decision Records, Automation Queue, ESI Sync, and Intelligence Refresh Runs surfaces render.
- Confirm worker and retry controls still present no-execution boundary language.
- Confirm no browser response includes MongoDB credentials, session secrets, OAuth secrets, worker secrets, sealing keys, access tokens, refresh tokens, or token hashes.

Use fixture/local browser smoke tests for deterministic coverage and live checks only for provider/environment verification. Do not trigger worker dispatch, EVE writes, role/access changes, wallet/asset/contract mutations, or external-service mutations as part of smoke verification.

## Rollback Procedure

Rollback is required if production shows missing required secrets, unsafe command scope behavior, broken EVE SSO callback, command API failures across core surfaces, MongoDB target ambiguity, secret exposure, or UI language implying execution authority beyond the roadmap boundary.

Rollback steps:

1. Capture the failing deploy id, commit SHA, timestamp, and symptom summary without secret values.
2. Revert to the previous known-good Netlify deploy or deploy the previous known-good commit.
3. Preserve MongoDB data; do not drop or recreate production databases as rollback.
4. Re-run smoke verification against the rollback target.
5. Record the incident, rollback target, verification result, and follow-up owner.

## Go/No-Go Record

Before promotion, record:

- Decision: go, no-go, or controlled staging only.
- Commit SHA and PR URL.
- Environment name.
- Validation command results.
- Netlify environment verification status.
- EVE SSO provider verification status.
- MongoDB backup/index/access verification status.
- Monitoring and alerting status.
- Rollback target.
- Commander/operator approval.

No-go if any required secret is missing, live SSO callback cannot be verified safely, MongoDB target is unclear, monitoring has no owner for production, rollback target is unknown, or command surfaces imply execution authority beyond the roadmap boundaries.
