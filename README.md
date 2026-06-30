# Gryyk-47 Greenfield

Gryyk-47 is being rebuilt as a command operating system for an EVE Online corporation. The product goal is not a generic chatbot. It is a data-driven loop for numbers, opportunity, and people, with automation doing the hands-and-feet work while the commander keeps decision authority.

Start here:

- Constitution: `.specify/memory/constitution.md`
- Roadmap: `docs/roadmap.md`
- Spec Kit commands: `.agents/skills/`

Current phase: People Worker Handoff in progress on `033-people-worker-handoff`.

## Local Development

The default test suite uses Jest in Node for contract and unit tests. Jest is capped at two workers in `jest.config.cjs` to keep local test runs dependable.

Useful commands:

- `npm test`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

`npm test` runs Jest in Node for contract and unit coverage. `npm run test:e2e` runs real-browser smoke validation for the command surfaces and uses deterministic local fixtures instead of live MongoDB, EVE, or Netlify credentials.

If browser binaries are not installed yet, run:

- `npx playwright install chromium`

Use Netlify Dev, not plain Vite, when validating function-backed API calls locally:

- `npm run dev:netlify`

## Server Environment

MongoDB credentials are server-side only. Do not expose them as `VITE_*`.

Required Netlify/server environment variables:

- `MONGODB_URI`
- `MONGODB_DB`
- `EVEONLINE_CORPORATION_ID`
- `WORKER_CALLBACK_SECRET`

`EVEONLINE_CORPORATION_ID` remains the local/test fallback scope when no authenticated session exists. Authenticated sessions use a signed HTTP-only cookie and take precedence over the fallback scope. The browser does not send or choose corporation identity through headers, query values, request bodies, or local storage.

Optional EVE SSO/session variables:

- `EVE_SESSION_SECRET`: signs session and SSO state cookies. Production must configure this server-side.
- `EVE_SSO_CLIENT_ID`: EVE SSO application client ID.
- `EVE_SSO_CLIENT_SECRET`: server-only EVE SSO application secret used by the live callback token exchange.
- `EVE_SSO_REDIRECT_URI`: server callback URL for `/api/eve-sso-callback`.
- `EVE_SSO_SCOPES`: optional SSO scopes; defaults to `publicData`.
- `EVE_SSO_METADATA_URL`: optional override for the EVE SSO metadata endpoint.
- `EVE_SSO_TOKEN_URL`: optional override for the EVE SSO token endpoint.
- `EVE_ESI_BASE_URL`: optional override for the ESI base URL used by read-only identity lookup.
- `EVE_SSO_TEST_IDENTITY_JSON`: deterministic local/test callback identity fixture. Do not use this for production identity validation.
- `ESI_TOKEN_VAULT_SEALING_KEY`: server-only sealing key for durable ESI token vault records. Production must configure this server-side.

The live EVE SSO callback exchanges authorization codes server-side, validates the EVE access-token JWT against EVE SSO metadata/JWKS, and resolves character corporation identity through read-only ESI lookup. Normal sign-in stores only browser-safe command session identity. Explicit ESI read-sync consent can store sealed token material in the server-side vault, but browser responses never include access tokens, refresh tokens, token hashes, sealing keys, OAuth secrets, MongoDB credentials, or worker secrets.

## MongoDB Data Sources

Use `MONGODB_DB` for the database the current app reads and writes at runtime. Keep additional MongoDB database names as explicitly named future integration variables rather than overloading `MONGODB_DB`.

Current notes:

- The Command Brief MVP expects `research_briefs` and `research_requests` in `MONGODB_DB`.
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

## People Operating Layer

The People Operating Layer reads processed member profiles and leadership follow-ups from MongoDB `member_profiles` and `leadership_followups`. It shows member identity, role context, activity, delegation, source coverage, and approval-gated follow-up creation.

M18 adds browser-safe People ingestion provenance to the member list surface. The browser shows whether People profiles are linked to completed ingestion history, historical profile records, or unavailable ingestion history; it also shows source count, profile count, identity/roles/activity/delegation status, recent ingestion history, and no-execution boundary language. This remains read-only: no retry scheduling, worker dispatch, ESI fetch, EVE write, role mutation, access mutation, or external-service execution occurs in browser or request paths.

M32 lets commanders record proposed decisions from People leadership follow-ups, approve or reject those People-origin decisions, and create queued planning work only after approval. Decision approval and queue creation remain separate commander actions. These flows do not dispatch workers, prepare handoffs, schedule retries, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or execute external services.

M33 lets commanders prepare durable worker handoffs from approved People queued work without leaving the People surface. The browser shows queue item state, handoff id/status after preparation, and no-execution boundary language. This flow does not dispatch workers, claim work, schedule retries, execute work, fetch ESI, write to EVE, change roles/access/standings, move assets/wallets/contracts, or call external services.

## ESI Token Vault Sync

M12 adds explicit-consent ESI token vaulting for future live read ingestion. The commander can inspect vault status, start read-sync consent, revoke consent, and prepare a Numbers sync request from an active vault.

Vault token material is sealed server-side before persistence in `esi_token_vaults`. Prepared read-sync records are stored in `esi_sync_requests` with queued status. This slice does not fetch ESI data, refresh tokens in workers, dispatch workers, schedule retries, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions in request paths.

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

For write-flow validation, use the isolated MongoDB database `gryyk47_greenfield_test` by setting `MONGODB_DB=gryyk47_greenfield_test` in local environment. It has seeded `research_briefs`, `research_requests`, and `strategic_decisions` records for the configured corporation scope.

## Automation Queue

The Automation Queue stores auditable queued work in MongoDB `automation_queue` records linked to approved `strategic_decisions`. Queue records are draft work orders, not execution results.

Worker handoff records are stored separately in MongoDB `worker_handoffs`. Handoff preparation creates durable worker-ready metadata for eligible queue items, returns existing active handoffs idempotently, and surfaces readiness/failure state in queue detail.

Worker callbacks can list ready handoffs, atomically claim a handoff, append safe progress events, and mark claimed work completed or failed. Callback requests require `WORKER_CALLBACK_SECRET` through the worker callback header. Callback handlers store safe audit metadata only; they do not dispatch workers, retry failed work, perform EVE actions, change permissions, move assets, touch wallets/contracts/standings, or call external services. Player-impacting queue work requires approval metadata already present on the source decision.

For write-flow validation, keep using the isolated MongoDB database `gryyk47_greenfield_test` and seed or reuse approved `strategic_decisions` records for the configured corporation scope before writing `automation_queue` or `worker_handoffs` records.

## People Operating Layer

The People Operating Layer reads grounded member context from MongoDB `member_profiles` and stores leadership follow-up records in `leadership_followups`.

M4 supports member profile list/detail views, stale and missing people data indicators, leadership follow-up creation, optional links to `strategic_decisions` and `automation_queue`, and explicit approval metadata for player-impacting follow-ups. It does not mutate roles, access, permissions, standings, EVE state, decision records, or queue item status.

For write-flow validation, keep using `gryyk47_greenfield_test` or another isolated MongoDB database before writing `leadership_followups` records.
