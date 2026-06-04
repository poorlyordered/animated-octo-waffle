# Gryyk-47 Greenfield Roadmap

## Vision

Build Gryyk-47 as a corporation command operating system for EVE Online: a data-driven loop that helps a commander see numbers, evaluate opportunity, understand people, and turn decisions into auditable automation.

## Architecture Direction

- Frontend: command center first, chat second. Chat remains useful, but core work happens through dashboards, briefs, queues, and decision records.
- Backend: short request/response APIs for reads and user-approved commands.
- Workers: long-running research, enrichment, summarization, and sync jobs run outside Netlify timeouts.
- Storage: MongoDB remains acceptable for operational documents, research briefs, requests, events, and decision records.
- AI: AI processors write structured outputs with source references, confidence, prompt/model metadata, and status.
- Integrations: EVE SSO, ESI, OvernightDesk, MongoDB, and future agent platforms enter through typed adapters.

## Operating Domains

1. Numbers
   - Corporation financial health
   - Asset and logistics visibility
   - Market and industry opportunities
   - Activity and operational cadence

2. Opportunity
   - Official EVE news and patch changes
   - Strategic implications from research briefs
   - Recruiting and corporation growth openings
   - Risk and timing windows

3. People
   - Member profiles and activity
   - Roles, trust, delegation, and onboarding
   - Social/operational graph
   - Retention and leadership workload

## First Milestones

### M0: Project Foundation

Goal: establish constitution, roadmap, repo structure, and development rules.

Deliverables:

- Spec Kit initialized
- Constitution ratified
- Greenfield roadmap captured
- Initial product architecture decision recorded
- First feature candidate selected

### M1: Command Brief MVP - Complete

Goal: show the commander the latest structured state of the corporation across numbers, opportunity, and people.

Delivered capabilities:

- Load latest processed research brief from MongoDB
- Show status of background intelligence jobs
- Present source count, confidence, model, and createdAt
- Surface recommended actions and watchlist
- Make missing data explicit

Validation:

- Spec: `specs/001-command-brief-mvp`
- Implementation committed in `c962920 feat: implement command brief mvp`
- Local validation covered lint, typecheck, tests, and production build

### M2: Decision Record Loop - Complete

Goal: let the commander turn a recommendation into a tracked decision.

Delivered capabilities:

- Save decision records
- Link decisions to source briefs and data snapshots
- Track status: proposed, approved, delegated, done, rejected
- Capture rationale and expected result
- Preserve explicit approval boundaries for player-impacting decisions
- Normalize existing `strategic_decisions` documents while writing new normalized records

Validation:

- Spec: `specs/002-decision-record-loop`
- Implementation committed in `f9420ba feat: implement decision record loop`
- Quickstart write-flow validation committed in `f940034 test: validate decision record quickstart target`
- Local validation covered lint, typecheck, tests, production build, and an isolated MongoDB write-flow check against `gryyk47_greenfield_test`

### M3: Automation Queue - Complete

Goal: model automation as auditable hands and feet.

Delivered capabilities:

- Queue tasks for workers or external agents
- Show status, owner, input, output, failure, and retry metadata
- Require approval for player-impacting actions
- Keep queue creation separate from worker dispatch, retries, EVE actions, and external-service mutations

Validation:

- Spec: `specs/003-automation-queue`
- Local validation covered lint, typecheck, tests, production build, and an isolated MongoDB write-flow check against `gryyk47_greenfield_test`

### M4: People Operating Layer - Complete

Goal: support recruiting, onboarding, delegation, and member health.

Delivered capabilities:

- Member profile summaries
- Activity and role views
- Missing and stale people-data indicators
- Leadership follow-up queue
- Optional links from follow-ups to decision records and automation queue items
- Approval boundaries for player-impacting follow-ups

Validation:

- Spec: `specs/004-people-operating-layer`
- Local validation covered lint, typecheck, Jest contract/unit tests, and production build
- Default tests now run without jsdom; UI/browser workflow coverage should be added as a future Playwright slice

### M5: Browser Workflow Smoke Tests - Complete

Goal: validate merged command operating surfaces in a real browser without reintroducing jsdom into default tests.

Delivered capabilities:

- Dedicated `npm run test:e2e` browser smoke command
- Deterministic local fixtures and request interception for command surfaces
- Browser checks for command brief, decision records, automation queue, and people surfaces
- Command-boundary checks for player-impacting approval and no-execution language
- Preserved fast Jest Node validation through `npm test`

Validation:

- Spec: `specs/005-browser-workflow-smoke`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M6: EVE SSO Session Scope - Complete

Goal: bind command API reads and writes to an authenticated commander session when one exists while preserving local fallback scope.

Delivered capabilities:

- Browser-safe EVE session state endpoint
- EVE SSO start and callback endpoints with signed anti-forgery state
- Signed HTTP-only command session scope cookie
- Session-first command API scope resolution with `EVEONLINE_CORPORATION_ID` fallback
- Sign-out flow that clears server-owned session state
- Command shell scope indicator for signed-in, fallback, and missing states
- Contract/unit coverage for signed cookies, callback state, fallback, missing scope, sign-out, and browser-controlled corporation identity rejection
- Browser smoke coverage for signed-out/fallback and signed-in session states

Validation:

- Spec: `specs/006-eve-sso-scope`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M7: Worker Handoff For Automation Queue - Complete

Goal: prepare approved queued automation work for external workers through durable, auditable handoff records without dispatching or executing work in request paths.

Delivered capabilities:

- Worker handoff contracts and browser-safe response schemas
- MongoDB-backed `worker_handoffs` record normalization, rules, and store helpers
- Handoff preparation from eligible automation queue items
- Idempotent active handoff behavior for repeated preparation requests
- Scoped worker handoff list/detail API
- Queue detail handoff readiness and failure summaries
- Browser-visible prepare-handoff controls with explicit no-execution language
- Contract/unit coverage for handoff schemas, payload derivation, eligibility, approval boundaries, duplicate active handoffs, and non-execution requests
- Browser smoke coverage for handoff-ready, handoff-blocked, and no-execution states

Validation:

- Spec: `specs/007-worker-handoff`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M8: Numbers Operating Layer - Complete

Goal: show read-only corporation health across wallet, assets, logistics, market, and activity from processed scoped data.

Delivered capabilities:

- Numbers contracts and browser-safe response schemas
- MongoDB-backed `numbers_snapshots` latest scoped read path
- Section normalization for wallet, assets, logistics, market, and activity
- Explicit stale and missing section states with safe reasons
- Provenance display with source count, confidence, model, prompt version, and created timestamp
- Observations, risks, opportunities, and display-only follow-up candidates
- Command shell Numbers surface with read-only/no-execution boundary copy
- Contract/unit coverage for snapshots, empty state, normalization, missing/stale behavior, scoped reads, and secret-free responses
- Browser smoke coverage for complete snapshots, stale/missing data, follow-up candidates, and read-only boundary language

Validation:

- Spec: `specs/008-numbers-layer`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M9: Live EVE SSO - Complete

Goal: validate live EVE SSO identity through a server-side adapter while keeping command-session scope browser-safe.

Delivered capabilities:

- Server-side authorization-code token exchange for EVE SSO callbacks
- EVE access-token JWT validation through SSO metadata/JWKS
- Issuer, audience, expiry, signature, and character-subject checks
- Read-only ESI character and corporation identity resolution
- Signed command session scope containing only character and corporation identity
- Deterministic local identity fixture preserved for contract and browser validation
- Safe callback failures that clear transient SSO state without exposing secrets, token material, or raw provider payloads
- Contract/unit coverage for live success, invalid token claims, credential non-exposure, safe errors, deterministic fixture precedence, token exchange, JWT validation, and ESI lookup failures

Validation:

- Spec: `specs/009-live-eve-sso`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M10: Worker Handoff Callbacks - Complete

Goal: let trusted workers poll, claim, report progress, complete, and fail prepared handoff records while preserving auditable non-execution boundaries.

Delivered capabilities:

- Worker callback request schemas for claim, progress, completion, and failure
- Server-side worker callback secret validation
- MongoDB-backed atomic claim transition from ready to claimed
- Worker-owned progress, completion, and failure state transitions
- Browser-safe handoff summaries with claimed worker, progress events, result summary, and failure metadata
- Commander handoff list/detail and queue-detail APIs preserved
- Browser smoke coverage for claimed, completed, and failed handoff states
- Contract/unit coverage for callback schemas, authorization, state transitions, duplicate claim prevention, safe metadata, and secret-free responses

Validation:

- Spec: `specs/010-worker-callbacks`
- Implementation merged in `00566a9 Merge pull request #8 from poorlyordered/010-worker-callbacks`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build
- Post-merge sanity check covered targeted worker handoff/callback Jest tests on `master`

### M11: Numbers Follow-Up Actions - Complete

Goal: let the commander convert Numbers follow-up candidates into auditable command artifacts without bypassing approval or execution boundaries.

Delivered capabilities:

- Create proposed decision records from eligible Numbers follow-up candidates
- Preserve Numbers snapshot provenance and follow-up origin context
- Surface existing decisions instead of creating duplicate decision records
- Create queued work only from approved Numbers follow-up decisions
- Preserve no-execution boundaries for worker dispatch, retry scheduling, EVE writes, wallet/asset movement, contracts, and external services
- Add contract/unit coverage and browser smoke coverage for the decision path

Validation:

- Spec: `specs/011-numbers-followup-actions`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M12: ESI Token Vault Sync - Complete

Goal: add explicit-consent ESI token vaulting and scoped read-sync preparation for future live data ingestion.

Delivered capabilities:

- Browser-safe ESI vault status for missing, active, and revoked consent
- Read-sync consent start using configured read-only ESI scopes
- EVE SSO callback support for creating sealed server-side token vault records
- Server-side token sealing through `ESI_TOKEN_VAULT_SEALING_KEY`
- Commander revocation of vaulted consent
- Queued Numbers read-sync request preparation from active vault consent
- Missing-scope, revoked-vault, duplicate-sync, and unsafe-field boundaries
- No ESI data fetching, worker dispatch, retry scheduling, EVE writes, wallet/asset movement, contract mutation, role mutation, or external-service execution in request paths
- Contract/unit coverage and browser smoke coverage for the vault and sync preparation path

Validation:

- Spec: `specs/012-esi-token-vault-sync`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M13: Worker Numbers ESI Ingestion - Complete

Goal: let trusted workers process prepared Numbers ESI sync requests and write processed Numbers snapshots.

Delivered capabilities:

- Worker-authorized ready, claim, run, and fail paths for `esi_sync_requests`
- Atomic queued-to-claimed sync request transition with worker identity
- Server-only token unsealing inside Numbers ingestion helpers
- Read-only ESI Numbers source fetches for wallet, assets, industry/logistics, and market data
- Processed `numbers_snapshots` writes with wallet, assets, logistics, market, and activity sections
- Partial ESI failure handling through missing/stale section states and safe failure summaries
- Completed and failed sync request metadata with snapshot linkage or failure reason
- No raw ESI payload retention, browser token exposure, worker dispatch, retry scheduling, EVE writes, wallet/asset movement, contract mutation, role mutation, or external-service execution
- Contract/unit coverage for worker request schemas, store transitions, ingestion normalization, partial failures, and secret-free responses

Validation:

- Spec: `specs/013-worker-numbers-esi-ingestion`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M14: Sync History Provenance - Complete

Goal: show browser-visible sync history and latest live Numbers provenance from completed ESI syncs.

Delivered capabilities:

- Browser-safe latest live Numbers provenance for snapshots produced by completed ESI syncs
- Historical snapshot and unavailable provenance modes when live sync linkage is missing
- Bounded recent Numbers sync history in ESI sync settings
- Queued, claimed, completed, failed, and partial sync outcome summaries
- Section-level health, source count, sync request linkage, timestamps, and safe failure reasons
- Read-only no-execution boundary language for Numbers provenance and sync history
- No retry scheduling, worker dispatch, token refresh, ESI fetch in browser/request paths, EVE writes, wallet/asset movement, contract mutation, role mutation, or external-service execution
- Contract/unit coverage and browser smoke coverage for provenance and history display

Validation:

- Spec: `specs/014-sync-history-provenance`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M15: Retry Scheduling - Complete

Goal: let commanders schedule auditable retry intent for failed worker handoffs and failed Numbers ESI syncs without executing the retry.

Delivered capabilities:

- Browser-safe retry scheduling contracts and schemas
- MongoDB-backed `retry_requests` records for failed worker handoffs and failed ESI sync requests
- Duplicate scheduled retry surfacing for the same failed target
- Failed handoff retry scheduling from automation queue detail
- Failed ESI sync retry scheduling from ESI sync history
- Scheduled retry status display next to failed handoffs and failed syncs
- Unsafe retry field rejection for dispatch/run-now/token/action-like browser inputs
- No handoff claim, worker dispatch, immediate retry, token refresh, ESI fetch in request paths, EVE write, wallet/asset movement, contract mutation, role mutation, or external-service execution

Validation:

- Spec: `specs/015-retry-scheduling`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M16: Retry Execution Worker - Complete

Goal: let trusted workers consume scheduled retry requests under commander-approved policy.

Delivered capabilities:

- Browser-safe retry execution contracts and schemas for scheduled, claimed, completed, and blocked retry states
- Worker-authorized due retry listing, atomic retry claim, and retry execution paths
- Failed worker handoff retry execution that creates a linked replacement ready handoff
- Failed Numbers ESI sync retry execution that creates a linked replacement queued sync request
- Consent and scope blocking for ESI sync retry execution without token exposure
- Completed and blocked retry outcome display in automation queue detail and ESI sync history
- Duplicate execution prevention through claim-before-execute state transitions
- No browser-triggered retry execution, external worker dispatch, replacement handoff claim, token refresh, ESI fetch, EVE write, wallet/asset movement, contract mutation, role mutation, or external-service execution

Validation:

- Spec: `specs/016-retry-execution-worker`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M17: Numbers Approval Handoff - Complete

Goal: make the browser-visible handoff from Numbers-created decisions into queued work explicit and auditable.

Delivered capabilities:

- Browser-safe Numbers approval handoff metadata on follow-up decision responses
- Browser-safe queue handoff metadata on approved follow-up queue responses
- Decision status, approval requirement, queue readiness, queue item linkage, duplicate state, and no-execution boundary display
- Server-derived handoff state from existing decision and queue records, not browser-provided overrides
- Unsafe approval handoff, queue status, provenance, dispatch, retry, EVE write, wallet, asset, contract, role, and external execution field rejection
- Browser smoke coverage for proposed approval-blocked handoffs and approved queued-work handoffs
- No decision approval mutation, worker dispatch, handoff claim, retry scheduling, ESI fetch, EVE write, wallet/asset movement, contract mutation, role mutation, or external-service execution

Validation:

- Spec: `specs/017-numbers-approval-handoff`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M18: People Ingestion Provenance - Complete

Goal: extend the browser-safe sync visibility pattern to People member profile provenance.

Delivered capabilities:

- Optional People ingestion provenance on member list responses
- Bounded, corporation-scoped recent People ingestion history from `people_ingestion_requests`
- Provenance modes for completed ingestion history, historical profile records, and unavailable history
- Conservative section coverage aggregation for identity, roles, activity, and delegation
- Browser rendering for provenance mode, source count, profile count, section status, recent history, and no-execution boundary language
- Contract, unit, and browser smoke coverage for provenance parsing, history normalization, fallback behavior, and no-execution copy
- No retry scheduling, worker dispatch, work claim, ESI fetch, EVE write, role mutation, access mutation, or external-service execution

Validation:

- Spec: `specs/018-people-ingestion-provenance`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M19: Opportunity Ingestion Provenance - Complete

Goal: extend the browser-safe sync visibility pattern to Opportunity research and command brief provenance.

Delivered capabilities:

- Optional Opportunity ingestion provenance on command brief responses
- Bounded, corporation- and focus-scoped recent Opportunity research history from `research_requests`
- Provenance modes for processed research history, historical command brief records, and unavailable history
- Section coverage for sources, impacts, recommendations, and watchlist
- Browser rendering for provenance mode, focus, source count, brief count, section status, recent history, and no-execution boundary language
- Contract, unit, and browser smoke coverage for provenance parsing, history normalization, fallback behavior, and no-execution copy
- No research scheduling, worker dispatch, work claim, ESI fetch, EVE write, or external-service execution

Validation:

- Spec: `specs/019-opportunity-ingestion-provenance`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M20: Retry Cancellation and Policy Controls - Complete

Goal: add commander-side cancellation and visible retry policy controls for scheduled or blocked retry requests.

Delivered capabilities:

- `canceled` retry status with canceled timestamp, actor, and reason metadata
- Browser-safe retry policy metadata on retry summaries
- Atomic cancellation of latest scheduled or blocked worker handoff retries
- Atomic cancellation of latest scheduled or blocked ESI sync retries
- Browser cancel controls on automation queue and ESI sync retry surfaces
- Browser rendering for one-active-scheduled-retry policy, cancelable status policy, and no-execution boundary language
- Contract, unit, and browser smoke coverage for cancellation, policy metadata, and no-execution copy
- No worker dispatch, retry claim, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/020-retry-cancellation-policy`
- Local validation covered lint, typecheck, Jest tests, Playwright browser smoke tests, and production build

### M21: Decision Approval Workflow Improvements - Complete

Goal: let commanders approve or reject Numbers-origin proposed decisions while keeping queue creation separate and explicit.

Delivered capabilities:

- Numbers-scoped decision status action for approving or rejecting follow-up decisions
- Server verification that the decision source context matches the requested Numbers snapshot and follow-up candidate
- Explicit approval text support for approved decisions and rejection notes in decision status history
- Browser-safe approval handoff metadata recomputed after approval or rejection
- Numbers browser controls for approve and reject after a decision is recorded
- Queue creation remains a separate commander action visible only after approved status
- Unsafe approval metadata, queue status, provenance, dispatch, retry, EVE write, wallet, asset, contract, role, and external execution field rejection
- No queued work creation, worker dispatch, handoff claim, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution during approval or rejection

Validation:

- Spec: `specs/021-decision-approval-workflow`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M22: Dedicated Opportunity Surface - Complete

Goal: promote Opportunity from command brief subsection to first-class operating surface.

Delivered capabilities:

- Dedicated Opportunity operating layer in the command-center sequence
- Opportunity summary, strategic impacts, recommendations, watchlist, and source references from processed command briefs
- Opportunity provenance mode, focus, source count, brief count, section status, and recent research history on the dedicated surface
- Client-side Opportunity surface view model for processed and unavailable states
- Explicit read-only boundary language for research scheduling, worker dispatch, ESI fetch, EVE writes, wallet/asset/contract/role mutation, and external execution
- Browser smoke coverage for the dedicated Opportunity surface
- No new backend route, durable collection, research scheduling, worker dispatch, ESI fetch, EVE write, or external-service execution

Validation:

- Spec: `specs/022-dedicated-opportunity-surface`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

## Near-Term Recommendation

Proceed to M23 selection after M22 review.

Recommended next-slice candidates:

- Retry rescheduling or retry history management once cancellation behavior has been reviewed.
- Decision approval list/filter improvements now that Numbers-origin approve/reject exists.
- Opportunity decision handoff from dedicated surface once Opportunity-specific provenance is stable.
