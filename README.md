# Gryyk-47 Greenfield

Gryyk-47 is being rebuilt as a command operating system for an EVE Online corporation. The product goal is not a generic chatbot. It is a data-driven loop for numbers, opportunity, and people, with automation doing the hands-and-feet work while the commander keeps decision authority.

Start here:

- Constitution: `.specify/memory/constitution.md`
- Roadmap: `docs/roadmap.md`
- Production readiness: `docs/production-readiness.md`
- Production operations: `docs/production-operations.md`
- Worker policy: `docs/worker-policy.md`
- Spec Kit commands: `.agents/skills/`

Current phase: M60 Commander Chat Interface is complete on `060-commander-chat-interface`. It adds durable commander chat sessions/messages, cited command-state answers, AI SDK Core/UI integration, a separate commander-chat prompt version, and explicit draft Decision Record creation.

## What Has Been Built

Gryyk-47 now has the core command-center loop in place:

- Command Brief: latest structured corporation state with source count, confidence, model/prompt metadata, watchlist, recommendations, and missing-data callouts.
- Decision Records: commander-owned decision tracking with source provenance, status filters, pagination, saved views, and explicit approval boundaries.
- Automation Queue: approved decisions can become auditable queued work without executing game or external actions.
- Worker Handoffs: approved queued work can be prepared for trusted workers, claimed/completed/failed by callbacks, and retried through auditable retry records.
- Numbers: read-only corporation health across wallet, assets, logistics, market, activity, follow-up candidates, and live/historical ESI provenance.
- Opportunity: official-news/research context, dedicated Opportunity surface, decision/queue workflow, ingestion preparation, worker callbacks, and retry controls.
- People: member profiles, ingestion provenance, leadership follow-ups, People-origin decisions, approved queued work, worker handoff preparation, and retry controls.
- ESI Token Vault Sync: explicit consent, sealed server-side token vault records, read-sync request preparation for Numbers/People/Opportunity, worker-owned sync completion/failure, and read-only sync history.
- Intelligence Refresh Runs: signed commanders can create durable Numbers/Opportunity/People refresh runs, trusted workers can report domain step outcomes, and Brain evaluation can link command briefs back to the refresh run.
- Commander Chat: signed commanders can ask cited questions over command state, continue durable chat sessions, and create proposed Decision Records from review-only chat drafts through an explicit action.
- Operations Health: read-only health summary for command APIs, ingestion posture, retries, worker secret configuration, filters, and browser-local saved views.
- Production Evidence: value-free deployment evidence recorder with local filters and unsafe secret/token/credential rejection.

The browser is intentionally a command and review surface. It does not dispatch workers, claim work, fetch ESI directly, write to EVE, mutate roles/access/standings, move wallets/assets/contracts, deploy, roll back, or call external services from request paths.

## Local Development

Use Node 22.x. Install dependencies once:

```sh
npm install
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite web dev server only. Use for static/browser fixture work. |
| `npm run dev:netlify` | Start Netlify Dev on port 8888 with function-backed API routes. Use this for realistic local app usage. |
| `npm test` | Run Jest contract/unit tests in Node. |
| `npm run test:e2e` | Run Playwright browser smoke tests with deterministic fixtures. |
| `npm run test:e2e:ui` | Run Playwright in UI mode. |
| `npm run lint` | Run ESLint across apps, functions, packages, and config. |
| `npm run typecheck` | Run TypeScript project references. |
| `npm run build` | Build contracts and the web app for production. |

`npm test` runs Jest in Node for contract and unit coverage. `npm run test:e2e` runs real-browser smoke validation for the command surfaces and uses deterministic local fixtures instead of live MongoDB, EVE, or Netlify credentials.

If browser binaries are not installed yet, run:

- `npx playwright install chromium`

Use Netlify Dev, not plain Vite, when validating function-backed API calls locally:

- `npm run dev:netlify`

Then open the local Netlify URL, usually:

- `http://localhost:8888`

## Using The Application

1. Start the app with `npm run dev:netlify`.
2. Configure the required server environment variables listed below. For local fixture-style browsing, `EVEONLINE_CORPORATION_ID` provides the fallback command scope when no signed EVE session exists. Production command access requires a signed EVE session.
3. Open the app in the browser. Without a signed session, the first screen is the Gryyk-47 EVE SSO access gate.
4. Sign in with an EVE character in the configured corporation, then review the Command Brief first. It shows the current corporation summary, operating-leg coverage, recommendations, watchlist, source metadata, and missing data.
5. Use the Numbers, Opportunity, and People surfaces for domain work:
   - Numbers: inspect wallet/assets/logistics/market/activity health, live ESI provenance, and Numbers follow-up candidates.
   - Opportunity: inspect research-backed opportunities, record decisions, approve/reject them, create queued planning work, prepare ingestion, and inspect retry history.
   - People: inspect member profiles, missing/stale people data, leadership follow-ups, People-origin decisions, approved queued work, worker handoffs, and retry history.
6. Use Decision Records to review the commander's decision backlog. Filters, pagination, and saved views organize records without changing their status.
7. Use Automation Queue and Worker Handoffs to inspect queued work and worker lifecycle state. Preparing a handoff creates durable metadata only; it does not dispatch or execute work.
8. Use ESI Token Vault to start explicit read-sync consent, inspect vault status, revoke consent, and prepare duplicate-safe read-sync requests for available domains. Tokens stay server-side and sealed.
9. Use Intelligence Refresh Runs to start a durable refresh across Numbers, Opportunity, and People, then inspect prepared domain steps, failures, warnings, and Brain/command-brief evaluation linkage.
10. Use Commander Chat to ask cited questions over command state and draft proposed Decision Records. Drafts are review-only until you explicitly create a proposed decision.
11. Use Operations Health to inspect command API evidence, ingestion posture, retry posture, worker callback secret state, and warnings.
12. Use Production Evidence to record value-free deployment posture after validation. Do not paste secrets, tokenized URLs, raw production records, connection strings, JWTs, cookies, or private keys; unsafe material is rejected before storage.

The expected operating pattern is: inspect evidence, record a decision, approve or reject explicitly, create queued work only after approval, prepare handoffs for workers when appropriate, and review safe outcomes/retries later.

## Quality Gate

Before merging product behavior changes, run:

```sh
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
git diff --check
```

For focused changes, run targeted suites first, then the full gate. Recent examples:

```sh
npm test -- people-followup
npm test -- production-evidence
npm test -- esi-sync
```

## Server Environment

MongoDB credentials are server-side only. Do not expose them as `VITE_*`.

Required Netlify/server environment variables:

- `MONGODB_URI`
- `MONGODB_DB`
- `EVEONLINE_CORPORATION_ID`
- `WORKER_CALLBACK_SECRET`

Optional class-specific worker callback secrets:

- `WORKER_HANDOFF_CALLBACK_SECRET`
- `RETRY_WORKER_CALLBACK_SECRET`
- `ESI_SYNC_WORKER_CALLBACK_SECRET`
- `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET`
- `OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET`
- `BRAIN_WORKER_CALLBACK_SECRET`
- `INTELLIGENCE_REFRESH_WORKER_CALLBACK_SECRET`

Class-specific worker secrets override the shared fallback for their worker class. See `docs/worker-policy.md`.

OpenRouter Brain variables:

- `OPENROUTER_API_KEY`: server-only OpenRouter API key for trusted Brain worker calls.
- `OPENROUTER_MODEL`: optional model slug; defaults to `openai/gpt-5.2`.
- `OPENROUTER_BASE_URL`: optional HTTPS API base URL override; defaults to `https://openrouter.ai/api/v1`.
- `OPENROUTER_APP_URL`: optional OpenRouter app attribution URL.
- `OPENROUTER_APP_TITLE`: optional OpenRouter app attribution title.
- `OPENROUTER_TIMEOUT_MS`: optional provider timeout override.
- `OPENROUTER_MAX_COMPLETION_TOKENS`: optional completion budget override.

Commander Chat variables:

- `COMMANDER_CHAT_PROMPT_VERSION`: optional chat prompt version; defaults to `commander-chat/v1`.
- `COMMANDER_CHAT_SYSTEM_PROMPT`: optional server-side system prompt override.
- `COMMANDER_CHAT_MODEL`: optional chat model override; falls back to `OPENROUTER_MODEL`.
- `COMMANDER_CHAT_TIMEOUT_MS`: optional provider timeout override.
- `COMMANDER_CHAT_MAX_COMPLETION_TOKENS`: optional chat completion budget override.
- `COMMANDER_CHAT_MAX_CONTEXT_CHARS`: optional bounded command-context size override.
- `COMMANDER_CHAT_MAX_HISTORY_MESSAGES`: optional bounded chat history window override.

The Brain worker endpoint is trusted-worker only. Do not expose OpenRouter keys as `VITE_*`, and do not call OpenRouter directly from browser code.

`EVEONLINE_CORPORATION_ID` remains the local/test fallback scope when no authenticated session exists and is always included in the authorized corporation list. Set optional `EVEONLINE_AUTHORIZED_CORPORATION_IDS` to a comma-separated list of additional EVE corporation IDs allowed to use the command site. Production is detected from `NODE_ENV=production` or Netlify `CONTEXT=production`; production command API reads and writes require a signed EVE session unless `GRYYK_ALLOW_FALLBACK_SCOPE=true` is deliberately configured for a controlled exception. Authenticated sessions use a signed HTTP-only cookie and take precedence over the fallback scope. The browser does not send or choose corporation identity through headers, query values, request bodies, or local storage.

Optional EVE SSO/session variables:

- `EVE_SESSION_SECRET`: signs session and SSO state cookies. Production must configure this server-side; no development fallback is used when `NODE_ENV=production` or `CONTEXT=production`.
- `EVEONLINE_AUTHORIZED_CORPORATION_IDS`: comma-separated additional corporation IDs authorized for signed-session command access. Keep this server-side and do not use it for browser-selected scope.
- `EVE_SSO_CLIENT_ID`: EVE SSO application client ID.
- `EVE_SSO_CLIENT_SECRET`: server-only EVE SSO application secret used by the live callback token exchange.
- `EVE_SSO_REDIRECT_URI`: server callback URL for `/api/eve-sso-callback`.
- `EVE_SSO_SCOPES`: optional SSO scopes; defaults to `publicData`.
- `EVE_SSO_METADATA_URL`: optional override for the EVE SSO metadata endpoint.
- `EVE_SSO_AUTHORIZATION_URL`: optional override for the EVE SSO authorization endpoint; normal runtime discovers this from metadata.
- `EVE_SSO_TOKEN_URL`: optional override for the EVE SSO token endpoint.
- `EVE_ESI_BASE_URL`: optional override for the ESI base URL used by read-only identity lookup.
- `EVE_SSO_TEST_IDENTITY_JSON`: deterministic local/test callback identity fixture. It is ignored when `NODE_ENV=production` or `CONTEXT=production`; do not configure it in production.
- `ESI_TOKEN_VAULT_SEALING_KEY`: server-only sealing key for durable ESI token vault records. Production must configure this server-side; no development fallback is used when `NODE_ENV=production` or `CONTEXT=production`.

The live EVE SSO flow discovers authorization, token, and JWKS endpoints from EVE SSO metadata, exchanges authorization codes server-side, validates the EVE access-token JWT against EVE SSO metadata/JWKS, and resolves character corporation identity through read-only ESI lookup. Normal sign-in stores only browser-safe command session identity. Explicit ESI read-sync consent can store sealed token material in the server-side vault, but browser responses never include access tokens, refresh tokens, token hashes, sealing keys, OAuth secrets, MongoDB credentials, or worker secrets.

Signed EVE sessions are authorized for command APIs only when the session corporation is listed in server-owned `EVEONLINE_CORPORATION_ID` or `EVEONLINE_AUTHORIZED_CORPORATION_IDS`. A signed session from an unlisted corporation receives a safe unauthorized response and does not fall back to a configured corporation. Authorized signed sessions are scoped to their own corporation ID. No-session local fallback remains available for development and deterministic tests; production no-session command API access receives a safe signed-session-required response.

## MongoDB Data Sources

Use `MONGODB_DB` for the database the current app reads and writes at runtime. Keep additional MongoDB database names as explicitly named future integration variables rather than overloading `MONGODB_DB`.

Current notes:

- The Command Brief MVP expects `research_briefs` and `research_requests` in `MONGODB_DB`.
- The OpenRouter Brain writes validated command intelligence to `research_briefs` and Brain lifecycle records to `research_requests` with focus `gryyk-47-brain`.
- Intelligence Refresh Runs store orchestration state in `intelligence_refresh_runs`; evaluation-linked Brain runs and command briefs include `refreshRunId` provenance.
- Commander Chat stores durable conversations in `commander_chat_sessions` and `commander_chat_messages`; proposed decisions created from chat drafts are stored in `strategic_decisions` with `commander_chat` source context.
- The Numbers operating layer expects processed read-only `numbers_snapshots` records in `MONGODB_DB`.
- The `gryyk47` database contains broader corporation context collections such as `corporation_context`, `strategic_decisions`, `asset_information`, and `research_briefs`.
- There is no collection named `Gryyk-47` in the checked `gryyk47` database. Treat `Gryyk-47` as the product/corporation label unless a future data audit identifies a real database or collection with that exact name.

## Numbers Operating Layer

The Numbers Operating Layer reads processed corporation health snapshots from MongoDB `numbers_snapshots`. It shows wallet, assets, logistics, market, and activity sections, provenance, stale/missing data indicators, and follow-up candidates.

M11 allows a commander to record a proposed decision from an eligible Numbers follow-up candidate. Queue creation from Numbers follow-ups remains gated by approved decision records. These flows do not call live EVE APIs, move ISK, move assets, change contracts, dispatch workers, claim handoffs, schedule retries, or mutate external services.

M17 makes that approval handoff browser-visible. Numbers follow-up action responses now include computed approval handoff metadata showing whether a decision is approval-blocked, queue-ready, linked to queued work, or duplicate-safe. The browser renders the decision and queue linkage without letting browser inputs forge approval, queue state, provenance, dispatch, retry, EVE write, wallet, asset, contract, role, or external execution metadata.

M21 adds explicit approve/reject controls for Numbers-origin proposed decisions. Approval updates the decision record and makes the handoff queue-ready, but it does not create queued work; queue creation remains a separate commander action. Rejection closes the decision as queue-blocked. These status actions do not dispatch workers, schedule retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

## Opportunity Research Layer

The Opportunity Research Layer is currently represented by processed command briefs from MongoDB `research_briefs` and recent research status from `research_requests`. It surfaces official-news opportunity context through source references, strategic impacts, recommendations, watchlists, and operating-leg coverage.

M19 adds browser-safe Opportunity ingestion provenance to the command brief response and browser surface. The browser shows whether Opportunity context is linked to processed research history, historical command brief records, or unavailable research history; it also shows source count, brief count, sources/impacts/recommendations/watchlist status, recent research history, and no-execution boundary language. This remains read-only: no research scheduling, worker dispatch, ESI fetch, EVE write, or external-service execution occurs in browser or request paths.

M22 adds a dedicated Opportunity operating layer in the command center. It reuses the existing command brief and Opportunity provenance APIs to show summary, strategic impacts, recommendations, watchlist, source references, section status, and recent research history as a first-class read-only surface. It does not schedule research, dispatch workers, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M23 lets commanders record proposed decisions directly from Opportunity recommendations on the dedicated Opportunity surface. The browser shows a safe Opportunity decision handoff with decision id, proposed status, source brief, source count, focus, provenance mode, and approval/queue separation language. It does not approve decisions, create queued work, schedule research, dispatch workers, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M27 lets commanders approve or reject recorded Opportunity decisions on the dedicated Opportunity surface, then create queued planning work as a separate action only after approval. Approval and rejection update only decision status; queue creation creates an auditable queued work record only. These flows do not schedule research, dispatch workers, prepare handoffs, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M43 lets commanders prepare durable Opportunity ingestion requests from the Opportunity surface, and lets trusted workers list, claim, complete, or fail those requests through worker-only callbacks. The browser shows queued/processing/processed/failed provenance, source count, sources/impacts/recommendations/watchlist section coverage, and no-execution boundary language. Browser preparation does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, mutate external services, or execute external calls.

## People Operating Layer

The People Operating Layer reads processed member profiles and leadership follow-ups from MongoDB `member_profiles` and `leadership_followups`. It shows member identity, role context, activity, delegation, source coverage, and approval-gated follow-up creation.

M18 adds browser-safe People ingestion provenance to the member list surface. The browser shows whether People profiles are linked to completed ingestion history, historical profile records, or unavailable ingestion history; it also shows source count, profile count, identity/roles/activity/delegation status, recent ingestion history, and no-execution boundary language. This remains read-only: no retry scheduling, worker dispatch, ESI fetch, EVE write, role mutation, access mutation, or external-service execution occurs in browser or request paths.

M32 lets commanders record proposed decisions from People leadership follow-ups, approve or reject those People-origin decisions, and create queued planning work only after approval. Decision approval and queue creation remain separate commander actions. These flows do not dispatch workers, prepare handoffs, schedule retries, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or execute external services.

M33 lets commanders prepare durable worker handoffs from approved People queued work without leaving the People surface. The browser shows queue item state, handoff id/status after preparation, and no-execution boundary language. This flow does not dispatch workers, claim work, schedule retries, execute work, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or call external services.

M34 lets commanders schedule, reschedule, apply retry delay policy, and cancel retries for failed People worker handoffs without leaving the People surface. The browser shows retry status, retry history, and no-execution boundary language while reusing the existing worker handoff retry APIs. This flow does not dispatch workers, claim handoffs, execute retries, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or call external services.

M42 lets commanders prepare durable People ingestion requests from the People surface, and lets trusted workers list, claim, complete, or fail those requests through worker-only callbacks. The browser shows queued/claimed/completed/failed provenance, source count, identity/roles/activity/delegation section coverage, and no-execution boundary language. Browser preparation does not dispatch workers, fetch ESI, retry, write to EVE, change roles/access/standings, move assets/wallets/contracts, or call external services.

M35 lets commanders apply Decision Records status and source filters through the API while keeping page size and pagination browser-local. Source filtering preserves Opportunity, Numbers, and People decision domains, including legacy Opportunity/brief decisions without source context. This flow does not approve decisions, create queued work, dispatch workers, schedule retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

M36 lets commanders filter retry history audits by retry status across Automation Queue, ESI sync, Opportunity, and People retry surfaces. Retry summaries preserve claim, completion, cancellation, replacement, blocked reason, and policy boundary details while keeping the audit controls browser-local and read-only. This flow does not schedule, cancel, reschedule, claim, dispatch, execute, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

M37 lets commanders page Decision Records through the API after applying server-side filters. The API returns bounded page sizes and pagination metadata, and the browser requests page/page-size changes instead of loading every filtered decision. This flow does not approve decisions, create queued work, dispatch workers, schedule retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

## ESI Token Vault Sync

M12 adds explicit-consent ESI token vaulting for future live read ingestion. The commander can inspect vault status, start read-sync consent, revoke consent, and prepare a Numbers sync request from an active vault.

Vault token material is sealed server-side before persistence in `esi_token_vaults`. Prepared read-sync records are stored in `esi_sync_requests` with queued status. This slice does not fetch ESI data, refresh tokens in workers, dispatch workers, schedule retries, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions in request paths.

M48 expands explicit read-consent planning to Numbers, People, and Opportunity read-sync domains. The vault surface can prepare duplicate-safe queued sync requests for each domain when scopes are available. People and Opportunity sync records are planning-only in this slice: the existing ESI sync worker remains restricted to Numbers execution, and no People/Opportunity ESI fetch, worker dispatch, EVE write, role/access/standing mutation, wallet/asset/contract mutation, or external-service mutation occurs.

M51 lets trusted ESI sync workers list, claim, fail, and externally complete People ESI sync requests. The in-process ESI worker run path remains Numbers-only, while People completion stores safe worker result summaries for claimed People requests. Opportunity ESI sync remains planning-only. Browser paths still do not fetch ESI, dispatch workers, write to EVE, mutate roles/access/standings, or execute external services.

M13 adds a trusted worker path for prepared Numbers sync requests. Worker-authenticated requests can list queued sync work, claim one request, run read-only ESI ingestion, write a processed `numbers_snapshots` record, and mark the sync request completed or failed with safe metadata. Raw ESI payloads and token material are not returned to the browser or persisted as command-surface data.

M14 makes worker-produced sync state inspectable in the browser. The Numbers surface shows whether the latest snapshot came from completed read-only ESI sync or historical processed data, including source count, section health, sync request linkage, and no-execution provenance language. The ESI sync surface shows bounded recent sync history with queued, claimed, completed, failed, and partial outcome summaries. This remains read-only: no retry scheduling, worker dispatch, token refresh, EVE writes, wallet/asset movement, contract mutation, role mutation, or external-service execution occurs in browser or request paths.

M15 adds commander-approved retry scheduling records for failed worker handoffs and failed Numbers ESI sync requests. Scheduling a retry creates an auditable `retry_requests` record and surfaces existing scheduled retries next to failed handoffs and failed sync history. It does not claim handoffs, dispatch workers, run retries immediately, refresh tokens, fetch ESI in request paths, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions.

M16 adds a trusted retry worker path for due scheduled retries. Worker-authenticated requests can list due retry requests, atomically claim one retry, prepare a replacement ready worker handoff for failed handoff retries, or prepare a replacement queued Numbers ESI sync request for failed sync retries. Retry execution outcomes are browser-visible as safe scheduled, claimed, completed, or blocked summaries. This still does not dispatch external workers, claim replacement handoffs, refresh tokens, fetch ESI data, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions in browser/request paths.

M20 adds commander-side cancellation and server-owned policy metadata for retry records. Scheduled and blocked retries can be canceled from the handoff and ESI sync surfaces with an auditable reason; claimed and completed retries remain non-cancelable. Retry summaries now state the one-active-scheduled-retry-per-target policy and no-execution boundary. Cancellation does not dispatch workers, claim retry work, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M25 adds bounded retry history visibility for failed worker handoffs and Numbers ESI sync requests. The browser now shows recent retry attempts with scheduled, canceled, blocked, completed, replacement, and policy metadata while preserving the latest retry field for existing controls. Retry history is read-only: it does not reschedule retries, dispatch workers, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M26 adds commander-side rescheduling for already scheduled retry records. Rescheduling updates the retry reason and optional not-before time while preserving the retry id, target, and scheduled status. Blocked, claimed, completed, and canceled retries cannot be rescheduled. Rescheduling does not dispatch workers, claim retry work, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M29 adds server-owned retry delay policy controls for scheduled worker handoff and Numbers ESI sync retries. Retry policy summaries now expose bounded timing options, and browser controls apply them through the existing scheduled-only reschedule path. Policy controls update retry timing only; they do not dispatch workers, claim retry work, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M30 adds Opportunity queued-work detail and explicit worker handoff preparation on the Opportunity surface. After an approved Opportunity decision creates queued work, the browser shows queue detail and lets the commander prepare a durable worker handoff through the existing automation queue handoff workflow. Handoff preparation does not dispatch workers, claim work, schedule retries, execute work, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

M31 adds Opportunity worker handoff retry controls for failed prepared handoffs. The Opportunity surface can schedule, reschedule, apply retry delay policy, and cancel handoff retries through the existing worker handoff retry APIs. Retry controls update retry records only; they do not dispatch workers, claim work, execute retries, fetch ESI, write to EVE, move wallets/assets/contracts, change roles, or execute external services.

## Decision Record Loop

The Decision Record Loop stores normalized decision records in the existing MongoDB `strategic_decisions` collection. Existing strategic decision fields such as `researchBriefId`, `decisionContext`, `finalDecision`, `gryykSynthesis`, and `timestamp` are treated as legacy-compatible inputs and normalized at the app boundary.

Decision records remain separate from executed actions and automation queue entries. Player-impacting decisions require explicit approval metadata before action-like progression, and this MVP still does not execute game actions or external-service changes.

Numbers-origin decision approval now has a scoped browser workflow. The server verifies the decision source context against the requested Numbers snapshot and follow-up candidate before approving or rejecting, then returns browser-safe handoff metadata for the updated status.

M24 adds browser-local decision list filters and workload counts. The decision loop can filter by status and source domain, labels Opportunity/brief vs Numbers follow-up records, and shows visible, total, proposed, approved, rejected, and player-impacting counts. Filtering does not approve decisions, create queued work, dispatch workers, retry, write to EVE, or execute external services.

M28 adds browser-local decision list pagination and persisted status/source/page-size filters. The list shows a bounded page, range summary, and previous/next controls while preserving filter settings in local storage. Pagination and filter persistence organize records only; they do not approve decisions, create queued work, dispatch workers, retry, fetch ESI, write to EVE, or execute external services.

M38 adds browser-local saved views for repeated Decision Records review contexts. Commanders can save, apply, and delete presets for status, source, and page size without creating backend preference state. Saved views organize review only; they do not approve decisions, create queued work, dispatch workers, retry, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

For write-flow validation, use the isolated MongoDB database `gryyk47_greenfield_test` by setting `MONGODB_DB=gryyk47_greenfield_test` in local environment. It has seeded `research_briefs`, `research_requests`, and `strategic_decisions` records for the configured corporation scope.

## Automation Queue

The Automation Queue stores auditable queued work in MongoDB `automation_queue` records linked to approved `strategic_decisions`. Queue records are draft work orders, not execution results.

Worker handoff records are stored separately in MongoDB `worker_handoffs`. Handoff preparation creates durable worker-ready metadata for eligible queue items, returns existing active handoffs idempotently, and surfaces readiness/failure state in queue detail.

Worker callbacks can list ready handoffs, atomically claim a handoff, append safe progress events, and mark claimed work completed or failed. Callback requests require a worker callback secret through the worker callback header. Callback handlers store safe audit metadata only; they do not dispatch workers, retry failed work, perform EVE actions, change permissions, move assets, touch wallets/contracts/standings, or call external services. Player-impacting queue work requires approval metadata already present on the source decision.

M44 adds class-specific worker callback secrets for worker handoffs, retry workers, ESI sync workers, People ingestion workers, and Opportunity ingestion workers while preserving `WORKER_CALLBACK_SECRET` as a compatibility fallback. Once a class-specific secret is configured, the shared fallback no longer authorizes that worker class. The worker policy runbook documents retry/backoff boundaries and browser no-dispatch guarantees.

M47 adds a read-only Operations Health surface backed by `/api/operations-health`. It summarizes command API evidence, Numbers/People/Opportunity ingestion posture, retry posture, worker callback secret state, and operations warnings with browser-safe statuses only. It does not expose secret values, token material, connection strings, raw production data, dispatch targets, or execution controls, and it does not fetch ESI, write to EVE, dispatch workers, execute retries, or mutate external services.

M50 adds browser-local filters to the Operations Health surface for warning severity, worker readiness status, and worker secret state. These filters organize already visible health summaries only; they do not store server preferences, call live providers, dispatch workers, execute retries, fetch ESI, write to EVE, or mutate external services.

M53 adds browser-local saved views to the Operations Health filter section for warning severity, worker readiness status, and worker secret state. Saved views stay in browser localStorage only; they do not store server preferences, call live providers, dispatch workers, execute retries, fetch ESI, write to EVE, or mutate external services.

M49 adds a value-free Production Evidence recorder backed by `/api/production-evidence`. It stores scoped deployment posture records with fixed validation checks, commit/deploy/rollback identifiers, safe operator attribution, and no-secret boundary text. It rejects obvious secret, token, cookie, JWT, connection string, private key, raw production record, and production export material before storage. It does not deploy, rollback, call live providers, fetch ESI, write to EVE, dispatch workers, execute retries, or mutate external services.

M52 adds browser-local Production Evidence filters for environment, decision, and check status. These filters organize already visible value-free evidence records only; they do not store server preferences, export production data, deploy, rollback, call live providers, dispatch workers, fetch ESI, write to EVE, or mutate external services.

M54 expands the worker-owned ESI sync lifecycle so trusted ESI workers can list, claim, externally complete, and fail Opportunity sync requests after explicit read consent. The in-process run action remains Numbers-only, and browser paths still do not fetch ESI, dispatch workers, write to EVE, mutate roles/access/standings, move wallets/assets/contracts, or call external services.

For write-flow validation, keep using the isolated MongoDB database `gryyk47_greenfield_test` and seed or reuse approved `strategic_decisions` records for the configured corporation scope before writing `automation_queue` or `worker_handoffs` records.

## People Operating Layer

The People Operating Layer reads grounded member context from MongoDB `member_profiles` and stores leadership follow-up records in `leadership_followups`.

M4 supports member profile list/detail views, stale and missing people data indicators, leadership follow-up creation, optional links to `strategic_decisions` and `automation_queue`, and explicit approval metadata for player-impacting follow-ups. It does not mutate roles, access, permissions, standings, EVE state, decision records, or queue item status.

For write-flow validation, keep using `gryyk47_greenfield_test` or another isolated MongoDB database before writing `leadership_followups` records.
