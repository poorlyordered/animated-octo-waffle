# Production Readiness Audit

Last reviewed: 2026-06-30

## Verdict

Status: conditionally ready for a controlled Netlify deployment after server environment and live provider configuration are verified.

Repo evidence proves the app builds, typechecks, lints, passes unit/contract tests, and has deterministic browser smoke coverage for the current command surfaces. Repo evidence does not prove that Netlify environment variables, the live EVE SSO application, MongoDB backup/index policy, or external monitoring are configured in a production account.

Use `docs/production-operations.md` for the operator checklist that converts these gaps into pre-deploy evidence, live-provider verification, monitoring, worker-secret rotation, deploy smoke, rollback, and go/no-go records.

## Build And Deploy Shape

- Runtime target: Node `22.x`.
- Build command: `npm run build`.
- Static publish directory: `apps/web/dist`.
- Functions directory: `netlify/functions`.
- API routing: `/api/*` redirects to `/.netlify/functions/:splat`.
- Local function validation entrypoint: `npm run dev:netlify` on port `8888`.
- Browser smoke entrypoint: `npm run test:e2e`, which builds and previews the web app with deterministic fixtures.

## Environment Checklist

Required for command API reads and writes:

- `MONGODB_URI`: server-side MongoDB connection string. Must start with `mongodb://` or `mongodb+srv://`.
- `MONGODB_DB`: runtime database name.
- `EVEONLINE_CORPORATION_ID`: local/test fallback corporation scope when no signed EVE session exists.

Required for trusted worker callbacks:

- `WORKER_CALLBACK_SECRET`: server-side fallback secret for trusted worker callback and retry endpoints when class-specific secrets are not configured.

Optional class-specific worker callback secrets:

- `WORKER_HANDOFF_CALLBACK_SECRET`: optional server-side secret for worker handoff callbacks.
- `RETRY_WORKER_CALLBACK_SECRET`: optional server-side secret for retry worker callbacks.
- `ESI_SYNC_WORKER_CALLBACK_SECRET`: optional server-side secret for ESI sync worker callbacks.
- `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET`: optional server-side secret for People ingestion worker callbacks.
- `OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET`: optional server-side secret for Opportunity ingestion worker callbacks.
- `BRAIN_WORKER_CALLBACK_SECRET`: optional server-side secret for OpenRouter Brain worker callbacks.

Required for live Brain runs:

- `OPENROUTER_API_KEY`: server-only OpenRouter API key. Never expose as `VITE_*`.

Optional Brain provider overrides:

- `OPENROUTER_MODEL`: model slug for Brain runs; defaults to `openai/gpt-5.2`.
- `OPENROUTER_BASE_URL`: HTTPS API base URL override; defaults to `https://openrouter.ai/api/v1`.
- `OPENROUTER_APP_URL`: optional OpenRouter attribution URL.
- `OPENROUTER_APP_TITLE`: optional OpenRouter attribution title.
- `OPENROUTER_TIMEOUT_MS`: optional provider timeout override.
- `OPENROUTER_MAX_COMPLETION_TOKENS`: optional completion budget override.

Production-required for secure sessions and token vaulting:

- `EVE_SESSION_SECRET`: production session-cookie signing secret. `GRYYK_SESSION_SECRET` is accepted by code as a legacy fallback, but production should prefer `EVE_SESSION_SECRET`. The app treats `NODE_ENV=production` or Netlify `CONTEXT=production` as production and will not use development fallback secrets in either case.
- `ESI_TOKEN_VAULT_SEALING_KEY`: production sealing key for persisted ESI token material. The app treats `NODE_ENV=production` or Netlify `CONTEXT=production` as production and will not use the development fallback key in either case.

Required for live EVE SSO session and ESI consent flows:

- `EVE_SSO_CLIENT_ID`: EVE SSO application client id.
- `EVE_SSO_CLIENT_SECRET`: server-only EVE SSO client secret.
- `EVE_SSO_REDIRECT_URI`: production callback URL for `/api/eve-sso-callback`.

Optional live-provider overrides:

- `EVE_SSO_SCOPES`: defaults to `publicData` for session sign-in; ESI consent flows request their own read scopes.
- `EVE_SSO_METADATA_URL`: defaults to the EVE SSO metadata endpoint.
- `EVE_SSO_TOKEN_URL`: defaults to the EVE SSO token endpoint.
- `EVE_ESI_BASE_URL`: defaults to the ESI latest base URL.

Test-only:

- `EVE_SSO_TEST_IDENTITY_JSON`: deterministic callback identity fixture. It is ignored by production runtime checks and should not be configured in production.

Do not expose any server variable as `VITE_*`. Browser responses must not include MongoDB credentials, session secrets, OAuth secrets, worker secrets, sealing keys, access tokens, refresh tokens, or token hashes.
Brain responses must not include OpenRouter API keys, raw provider payloads, or unvalidated model output.

## Pre-Deploy Validation

Run these from the repo root before creating a production deploy:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
git diff --check
```

The browser smoke suite uses fixtures and proves the command surfaces render and preserve no-execution boundaries. It does not prove live MongoDB, live EVE SSO, live ESI, or Netlify environment configuration.

## Command-Surface Coverage

Current deterministic smoke coverage includes:

- Command brief operating-leg coverage.
- Opportunity surface provenance, decision recording, approval/rejection, queue creation, worker handoff, and retry controls.
- Decision Records detail, server-backed filters/pagination, saved views, and persisted browser filters.
- Automation Queue detail and worker handoff readiness.
- People member/follow-up surfaces, decision flow, queued work, handoff preparation, and retry controls.
- ESI token vault and sync surfaces in fixture-driven browser flows.
- Session scope and command-boundary smoke tests.

## No-Execution Boundary

Production readiness does not authorize automatic player-impacting execution. The current command loop may display observations, record decisions, create auditable queued work, prepare worker handoffs, and manage retry records only through explicit commander controls.

The system must not implicitly dispatch external workers, claim replacement work from browser actions, fetch ESI from request paths outside scoped read flows, write to EVE, move wallets/assets/contracts, change roles/access/standings, or mutate external services without a separately specified and approved feature.

## Known Gaps

- Live Netlify environment values have not been verified in this repo audit.
- EVE SSO production redirect URI and app configuration have not been verified from live provider state.
- MongoDB backup, index, retention, and least-privilege user policy are not documented in this repo.
- External uptime/error monitoring is not configured or documented here.
- Repo-side commander authorization policy is implemented for signed-session corporation matching, but live EVE SSO provider configuration has not been verified.
- Repo-side worker secret separation is implemented with class-specific worker secrets and shared fallback compatibility, but production secret values and rotation posture have not been verified.

## Go/No-Go

Go for controlled staging or production deploy only when:

- All pre-deploy validation commands pass.
- Required and production-required server variables are configured in Netlify.
- `EVE_SSO_TEST_IDENTITY_JSON` is absent from production.
- Live EVE SSO redirect URI matches the deployed callback URL.
- MongoDB production database, backup posture, and access policy are confirmed.
- Rollback path is understood: revert to the previous Netlify deploy and keep MongoDB data intact.

No-go if any required secret is missing, live SSO callback cannot be verified safely, MongoDB target is unclear, or command surfaces imply execution authority beyond the roadmap boundaries.
