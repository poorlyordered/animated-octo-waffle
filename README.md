# Gryyk-47 Greenfield

Gryyk-47 is being rebuilt as a command operating system for an EVE Online corporation. The product goal is not a generic chatbot. It is a data-driven loop for numbers, opportunity, and people, with automation doing the hands-and-feet work while the commander keeps decision authority.

Start here:

- Constitution: `.specify/memory/constitution.md`
- Roadmap: `docs/roadmap.md`
- Spec Kit commands: `.agents/skills/`

Current phase: Worker Numbers ESI Ingestion in progress on `013-worker-numbers-esi-ingestion`.

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

## ESI Token Vault Sync

M12 adds explicit-consent ESI token vaulting for future live read ingestion. The commander can inspect vault status, start read-sync consent, revoke consent, and prepare a Numbers sync request from an active vault.

Vault token material is sealed server-side before persistence in `esi_token_vaults`. Prepared read-sync records are stored in `esi_sync_requests` with queued status. This slice does not fetch ESI data, refresh tokens in workers, dispatch workers, schedule retries, write to EVE, move wallets/assets/contracts, change roles, or execute external-service actions in request paths.

M13 adds a trusted worker path for prepared Numbers sync requests. Worker-authenticated requests can list queued sync work, claim one request, run read-only ESI ingestion, write a processed `numbers_snapshots` record, and mark the sync request completed or failed with safe metadata. Raw ESI payloads and token material are not returned to the browser or persisted as command-surface data.

## Decision Record Loop

The Decision Record Loop stores normalized decision records in the existing MongoDB `strategic_decisions` collection. Existing strategic decision fields such as `researchBriefId`, `decisionContext`, `finalDecision`, `gryykSynthesis`, and `timestamp` are treated as legacy-compatible inputs and normalized at the app boundary.

Decision records remain separate from executed actions and automation queue entries. Player-impacting decisions require explicit approval metadata before action-like progression, and this MVP still does not execute game actions or external-service changes.

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
