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

### M23: Opportunity Decision Handoff - Complete

Goal: let commanders record proposed decisions from recommendations on the dedicated Opportunity surface.

Delivered capabilities:

- Record decision controls on dedicated Opportunity recommendations
- Existing decision-record API reuse for Opportunity source-brief recommendations
- Browser-safe Opportunity decision handoff metadata after decision creation
- Handoff display for decision id, proposed status, source brief, source count, focus, and provenance mode
- Explicit approval, queueing, research scheduling, worker dispatch, ESI fetch, EVE write, wallet/asset/contract/role mutation, and external execution boundary language
- Unit coverage for handoff derivation with and without Opportunity provenance
- Browser smoke coverage for recording an Opportunity decision without queueing or execution
- No new backend route, durable collection, decision approval, queue creation, research scheduling, worker dispatch, ESI fetch, EVE write, or external-service execution

Validation:

- Spec: `specs/023-opportunity-decision-handoff`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M24: Decision List Filters - Complete

Goal: improve decision-loop review after Numbers and Opportunity decision flows were added.

Delivered capabilities:

- Browser-local decision status filters for proposed, approved, delegated, done, and rejected records
- Browser-local source filters for Opportunity/brief and Numbers follow-up decisions
- Source-domain labels on decision list rows
- Workload counts for visible, total, proposed, approved, rejected, and player-impacting decisions
- Mixed-source browser fixtures covering Opportunity/brief, Numbers follow-up, approved, proposed, rejected, and player-impacting decisions
- Unit coverage for filter derivation, source labels, and counts
- Browser smoke coverage for status/source filtering and no-execution boundary language
- No backend route, durable collection, approval mutation, queue creation, worker dispatch, retry, ESI fetch, EVE write, or external-service execution

Validation:

- Spec: `specs/024-decision-list-filters`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M25: Retry History Management - Complete

Goal: make retry attempts auditable beyond the latest retry status.

Delivered capabilities:

- Bounded retry history for worker handoff detail responses
- Bounded retry history for automation queue detail handoff summaries
- Bounded retry history for Numbers ESI sync history items
- Latest `retry` field preserved for existing schedule and cancel controls
- Browser display for scheduled, canceled, blocked, completed, replacement, and policy metadata across recent attempts
- Store helper scoped by corporation, target type, target id, and bounded limit
- Contract/unit coverage for retry history arrays and scoped history listing
- Browser smoke coverage for worker handoff and ESI sync retry history visibility
- No retry rescheduling, policy editing, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/025-retry-history-management`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M26: Retry Rescheduling Controls - Complete

Goal: let commanders defer already scheduled retry work without canceling and recreating the retry record.

Delivered capabilities:

- Retry policy summaries now expose server-owned `canReschedule` eligibility
- Scheduled worker handoff retries can be rescheduled with a new reason and optional not-before time
- Scheduled Numbers ESI sync retries can be rescheduled with a new reason and optional not-before time
- Rescheduling preserves retry id, target, and scheduled status
- Blocked, claimed, completed, and canceled retries remain non-reschedulable
- Browser controls for rescheduling scheduled retries on worker handoff and ESI sync surfaces
- Contract/unit coverage for reschedule payloads, policy eligibility, and scheduled-only store mutation
- Browser smoke coverage for worker handoff and ESI sync reschedule controls
- No retry policy editing, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/026-retry-rescheduling-controls`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M27: Opportunity Approval Handoff - Complete

Goal: let commanders approve or reject Opportunity-origin decisions and create queued work only as a separate explicit action.

Delivered capabilities:

- Opportunity decision handoff now shows approval required/resolved and queue ready/blocked/linkage states
- Approve and reject controls appear after recording a proposed Opportunity decision
- Opportunity approval uses the existing decision status workflow and does not create queued work
- Opportunity queue creation appears only after approved status
- Opportunity queued work uses the existing automation queue workflow
- Browser-visible queue handoff shows queue item id/status after creation
- Unit coverage for proposed, approved, queued, and rejected Opportunity handoff derivation
- Browser smoke coverage for approve-then-queue and reject-without-queue workflows
- No new backend route, automatic queue creation, research scheduling, worker dispatch, handoff preparation, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/027-opportunity-approval-handoff`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, and production build

### M28: Decision List Pagination and Persisted Filters - Complete

Goal: keep the decision loop scannable as mixed Numbers and Opportunity decisions grow.

Delivered capabilities:

- Browser-local status/source/page-size filter persistence
- Safe defaults for invalid or missing persisted filter settings
- Bounded page size options for decision list review
- Current-page result window with range summary
- Previous/next pagination controls with first/last-page disabled states
- Filter and page-size changes reset to page 1
- Expanded browser fixtures for multi-page decision review
- Unit coverage for persisted settings parsing, local storage read/write, and clamped pagination
- Browser smoke coverage for page navigation, filter reset, and reload persistence
- No backend route, durable preference storage, approval mutation, queue creation, worker dispatch, retry, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/028-decision-list-pagination-persistence`
- Local validation covered lint, typecheck, targeted Jest tests, full Jest tests, Playwright browser smoke tests, targeted post-fix browser smoke tests, and production build

### M29: Retry Policy Controls - Complete

Goal: add bounded commander-visible retry timing controls beyond the current fixed one-hour reschedule path.

Delivered capabilities:

- Retry policy summaries now expose server-owned delay options
- Bounded retry delay choices for run when due, defer 1 hour, defer 6 hours, and defer 24 hours
- Worker handoff retry policy controls rendered only for scheduled reschedulable retries
- Numbers ESI sync retry policy controls rendered only for scheduled reschedulable retries
- Existing scheduled-only reschedule APIs reused to apply selected timing policy
- Immediate policy clears not-before; deferred policies set a future not-before timestamp
- Browser fixtures echo selected policy reasons for smoke validation
- Contract, unit, and browser smoke coverage for delay policy metadata and no-execution language
- No worker dispatch, retry claim, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/029-retry-policy-controls`
- Local validation covered lint, typecheck, full Jest tests, targeted Playwright browser smoke tests, and production build

### M30: Opportunity Worker Handoff - Complete

Goal: let commanders review Opportunity queued-work detail and explicitly prepare worker handoffs from the Opportunity surface.

Delivered capabilities:

- Opportunity queued-work detail after approved Opportunity queue creation
- Queue item id, status, task intent, expected output, and attempts shown without leaving the Opportunity surface
- Worker handoff state shown as not prepared or ready with handoff id/status
- Explicit Prepare worker handoff control wired to the existing automation queue handoff workflow
- Opportunity queued-work handoff view model with browser-safe no-execution boundary copy
- Unit coverage for queued-work detail before and after handoff preparation
- Browser smoke coverage for Opportunity decision approval, queue creation, queued-work detail, and worker handoff preparation
- No worker dispatch, handoff claim, retry scheduling, worker execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/030-opportunity-worker-handoff`
- Local validation covered lint, typecheck, full Jest tests, targeted Playwright browser smoke tests, and production build

### M31: Opportunity Handoff Retry Controls - Complete

Goal: let commanders manage retries for failed Opportunity worker handoffs without leaving the Opportunity surface.

Delivered capabilities:

- Failed Opportunity worker handoff details shown in queued-work detail
- Schedule handoff retry control for failed Opportunity handoffs
- Cancel and reschedule controls for scheduled Opportunity handoff retries
- Retry delay policy controls reused from server-owned retry policy metadata
- Local Opportunity handoff detail updates after retry schedule, cancel, and reschedule responses
- Browser-visible retry history and no-execution boundary language
- Existing worker handoff retry APIs reused; no Opportunity-specific retry route added
- Unit coverage for failed Opportunity handoff retry metadata
- Browser smoke coverage for schedule, reschedule, delay policy, and cancel controls
- No worker dispatch, handoff claim, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/031-opportunity-handoff-retry-controls`
- Local validation covered lint, typecheck, full Jest tests, targeted Playwright browser smoke tests, and production build

### M32: People Follow-Up Handoff - Complete

Goal: let commanders move People leadership follow-ups through the same auditable decision, approval, and queued-work handoff loop as Numbers and Opportunity.

Delivered capabilities:

- People follow-up decision handoff contracts and browser-safe response schemas
- Server-derived handoff metadata for decision, approval, queue readiness, queue linkage, and no-execution boundaries
- Record-decision control for leadership follow-ups without creating queued work
- Approve and reject controls for People-origin proposed decisions
- Queue creation control only after approved People-origin decisions
- Duplicate decision and queued-work attempts surface existing linkage instead of creating duplicate artifacts
- Unsafe browser-controlled approval, queue, provenance, dispatch, retry, role/access, EVE write, and external execution fields rejected
- Contract/unit coverage for People handoff schemas, state derivation, unsafe-field rejection, and no-execution boundaries
- Browser smoke coverage for People decision recording, approval, queued work, and boundary language
- No worker dispatch, handoff preparation, retry scheduling, retry execution, ESI fetch, EVE write, role/access/standings mutation, wallet/asset/contract movement, or external-service execution

Validation:

- Spec: `specs/032-people-followup-handoff`
- Local validation covered targeted People Jest tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M33: People Worker Handoff - Complete

Goal: let commanders prepare durable worker handoffs from approved People queued work without leaving the People surface.

Delivered capabilities:

- People queued-work detail on leadership follow-up rows after queue creation
- Explicit Prepare worker handoff control for linked People queued work
- Existing automation queue worker handoff API reused; no People-specific backend route added
- Browser-visible handoff id, status, and created timestamp after preparation
- No-execution boundary language for People worker handoff preparation
- Unit and browser smoke coverage for People worker handoff visibility and preparation
- No worker dispatch, handoff claim, retry scheduling, retry execution, ESI fetch, EVE write, role/access/standings mutation, wallet/asset/contract movement, or external-service execution

Validation:

- Spec: `specs/033-people-worker-handoff`
- Local validation covered targeted People Jest tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M34: People Handoff Retry Controls - Complete

Goal: let commanders manage retries for failed People worker handoffs without leaving the People surface.

Delivered capabilities:

- Failed People worker handoff details shown in leadership follow-up queued-work detail
- Schedule handoff retry control for failed People handoffs
- Cancel and reschedule controls for scheduled People handoff retries
- Retry delay policy controls reused from server-owned retry policy metadata
- Local People handoff detail updates after retry schedule, cancel, and reschedule responses
- Browser-visible retry status, retry history, and no-execution boundary language
- Existing worker handoff retry APIs reused; no People-specific retry route added
- Unit coverage for failed People handoff retry metadata
- Browser smoke coverage for schedule, reschedule, delay policy, and cancel controls
- No worker dispatch, handoff claim, retry execution, ESI fetch, EVE write, role/access/standings mutation, wallet/asset/contract movement, or external-service execution

Validation:

- Spec: `specs/034-people-handoff-retry-controls`
- Local validation covered targeted People Jest tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M35: Decision Backend Filtering - Complete

Goal: apply Decision Records status and source filters through the API while preserving browser-local pagination ergonomics.

Delivered capabilities:

- Bounded decision source filter contract for Opportunity, Numbers, and People
- Decision-record API query parsing for status and source filters
- Mongo query construction for status, source, and existing source-brief filters
- Opportunity filtering includes legacy brief decisions without source context
- Decision-record client query parameter support
- Decision Records route reloads filtered records when status/source filters change
- Existing page-size persistence and pagination remain browser-local
- Browser fixtures honor decision-record query filters for smoke validation
- Unit coverage for browser-to-server filter mapping and query construction
- No approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/035-decision-backend-filtering`
- Local validation covered targeted unit tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M36: Cross-Surface Retry Audit Filtering - Complete

Goal: keep retry histories scannable across command surfaces as recovery attempts grow.

Delivered capabilities:

- Shared retry audit status filter helper for all retry request statuses
- Shared retry audit history component with all-status and per-status filtering
- Automation Queue worker handoff retry history uses the shared audit filter
- ESI sync retry history uses the shared audit filter
- Opportunity worker handoff retry history uses the shared audit filter
- People worker handoff retry history uses the shared audit filter
- Retry summaries preserve claim, completion, cancellation, replacement, blocked reason, and policy boundary details
- Empty filtered retry histories keep controls visible and show an explicit empty state
- Unit coverage for retry audit filtering and summary preservation
- Browser smoke coverage for worker handoff and ESI retry history filtered states
- No retry scheduling, cancellation, rescheduling, worker claim, worker dispatch, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution from filtering

Validation:

- Spec: `specs/036-cross-surface-retry-audit-filtering`
- Local validation covered targeted unit tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M37: Decision Backend Pagination - Complete

Goal: page Decision Records through the API so large filtered result sets do not have to load fully into the browser.

Delivered capabilities:

- Bounded decision page-size contract shared by API and browser
- Decision list response pagination metadata for page, page size, totals, and visible item range
- Decision-record store counts filtered records and returns only the requested page
- Out-of-range page requests clamp to the final available page
- Empty result sets return page 1 of 1 with zero start/end indexes
- Decision-record API parses page and page-size query parameters
- Decision-record client sends page and page-size query parameters
- Decision Records browser route stores and renders server pagination metadata
- Browser fixtures return paginated decision responses for smoke validation
- Contract/unit coverage for paginated response shape and metadata clamping
- No approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/037-decision-backend-pagination`
- Local validation covered targeted unit tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M38: Decision Saved Views - Complete

Goal: let commanders save reusable Decision Records filter presets for repeated operational review contexts.

Delivered capabilities:

- Browser-local saved views for status, source, and page-size settings
- Saved-view selection, save, and delete controls in the Decision Records filter bar
- Duplicate-safe saves keyed by the saved filter tuple
- Applying a saved view restores status/source/page-size settings and resets pagination to page 1
- Malformed saved-view localStorage entries are ignored safely
- Decision filter accessibility improved with stable select ids and explicit labels
- Unit coverage for saved-view parsing, persistence, duplicate-safe saves, and malformed storage recovery
- Browser smoke coverage for saving, applying, deleting, and preserving existing filter reload behavior
- No backend route, server preference storage, approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/038-decision-saved-views`
- Local validation covered targeted unit tests, targeted Playwright browser smoke tests, typecheck, lint, full Jest tests, and production build

### M39: Roadmap Backlog Refresh - Complete

Goal: convert the exhausted M38 recommendation into a concrete next-slice backlog so feature-by-feature development can continue from current repo evidence.

Delivered capabilities:

- Current roadmap tail audited after M38 completion
- Deferred future-slice notes reviewed across prior specs and repo-facing documentation
- Next-slice candidates reordered around command-loop stabilization before capability expansion
- Production readiness audit selected as the recommended next slice
- Follow-on candidates scoped for live authorization, ingestion expansion, and worker policy hardening
- No product behavior, backend route, server preference storage, approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/039-roadmap-backlog-refresh`
- Local validation covered roadmap consistency review, code-review-and-quality gate, and diff hygiene

### M40: Production Readiness Audit - Complete

Goal: verify the current Decision/Numbers/Opportunity/People command loop is ready for a controlled deployment pass before adding new capability.

Delivered capabilities:

- Production readiness audit captured in `docs/production-readiness.md`
- Netlify build, publish, function, API redirect, Node runtime, and local validation shape documented
- Required, production-required, optional, and test-only environment variables classified without exposing secret values
- Pre-deploy validation command sequence documented
- Command-surface smoke coverage summarized for the current command loop
- Conditional readiness verdict recorded with clear distinction between repo-verified evidence and unverified live provider facts
- Known gaps documented for live Netlify env, EVE SSO app config, MongoDB backup/index/access policy, monitoring, commander authorization, and worker secret separation
- No product behavior, live deployment, backend route, server preference storage, approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/040-production-readiness-audit`
- Local validation covered typecheck, lint, full Jest tests, full Playwright browser smoke tests, production build, code-review-and-quality gate, and diff hygiene

### M41: Commander Authorization Policy - Complete

Goal: ensure signed EVE sessions can access command APIs only when their corporation matches the server-owned command corporation.

Delivered capabilities:

- Command scope resolution now verifies signed session corporation id against `EVEONLINE_CORPORATION_ID`
- Valid signed sessions for the configured corporation continue to resolve as session scope
- Signed sessions from another corporation receive safe unauthorized command API responses
- Mismatched signed sessions no longer fall back to configured corporation data
- No-session fallback scope remains available for local development and deterministic tests
- Session state contract now includes an unauthorized state with display-safe character/corporation identity and reason text
- Browser command scope status renders unauthorized signed sessions with a sign-out control
- Unit and contract coverage for authorized session, unauthorized mismatched session, fallback, missing state, and command API 403 behavior
- No product behavior beyond auth policy, live deployment, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/041-commander-authorization-policy`
- Local validation covered targeted auth/session/API tests, typecheck, lint, full Jest tests, full Playwright browser smoke tests, production build, code-review-and-quality gate, and diff hygiene

### M42: People Ingestion Expansion - Complete

Goal: design worker-backed People ingestion beyond historical profile records so member activity, roles, and delegation context can refresh through auditable long-running jobs.

Delivered capabilities:

- Commander-facing People ingestion prepare endpoint
- Browser control to prepare People ingestion from the People provenance panel
- Duplicate-safe active request handling per corporation scope
- Worker-only People ingestion endpoint for list, claim, complete, and fail callbacks
- Atomic claim transition and worker-owned completion/failure transitions
- Browser-safe provenance for queued, claimed, completed, and failed People ingestion requests
- Source count and identity/roles/activity/delegation section coverage in completed worker summaries
- Contract/unit/browser coverage for prepare payloads, worker payloads, duplicate active requests, state transitions, and no-execution boundary language
- No browser/request-path worker dispatch, retry scheduling, ESI fetch, EVE write, role/access/standing mutation, wallet/asset/contract mutation, or external-service execution

Validation:

- Spec: `specs/042-people-ingestion-expansion`
- Local validation covered targeted People contract/unit tests, typecheck, lint, full Jest tests, full Playwright browser smoke tests, production build, code-review-and-quality gate, and diff hygiene

### M43: Opportunity Ingestion Expansion - Complete

Goal: add a worker-backed Opportunity refresh path beyond latest processed briefs, with source provenance and safe failure states.

Delivered capabilities:

- Commander-facing Opportunity ingestion prepare endpoint
- Browser control to prepare Opportunity ingestion from the Opportunity provenance panel
- Duplicate-safe active request handling per corporation scope and focus
- Worker-only Opportunity ingestion endpoint for list, claim, complete, and fail callbacks
- Atomic claim transition from queued to processing and worker-owned completion/failure transitions
- Browser-safe provenance for queued, processing, processed, and failed Opportunity ingestion requests
- Source count and sources/impacts/recommendations/watchlist section coverage in completed worker summaries
- Contract/unit/browser coverage for prepare payloads, worker payloads, duplicate active requests, state transitions, and no-execution boundary language
- No browser/request-path research scheduling, worker dispatch, ESI fetch, EVE write, external-service mutation, or external-service execution

Validation:

- Spec: `specs/043-opportunity-ingestion-expansion`
- Local validation covered targeted Opportunity contract/unit tests, typecheck, lint, full Jest tests, full Playwright browser smoke tests, production build, code-review-and-quality gate, and diff hygiene

### M44: Worker Policy Hardening - Complete

Goal: review worker secret separation, retry/backoff policy, and operational runbooks for multiple worker classes while preserving commander approval boundaries.

Delivered capabilities:

- Class-specific worker callback secret support for worker handoffs, retry workers, ESI sync workers, People ingestion workers, and Opportunity ingestion workers
- Shared `WORKER_CALLBACK_SECRET` compatibility fallback when a class-specific secret is not configured
- Class-specific secrets override the shared fallback for their worker class once configured
- Worker endpoint call sites now pass server-owned worker classes instead of accepting client-selected classes
- Worker policy runbook documents worker classes, class secret env vars, retry/backoff boundaries, and no-execution browser guarantees
- Unit coverage for class-specific authorization, cross-class rejection, fallback compatibility, and class override behavior
- No browser/client secret exposure, dispatch, claim, retry execution, ESI fetch, EVE write, external-service mutation, or commander approval bypass

Validation:

- Spec: `specs/044-worker-policy-hardening`
- Local validation covered targeted worker callback auth tests, typecheck, lint, full Jest tests, full Playwright browser smoke tests, production build, code-review-and-quality gate, and diff hygiene

## Near-Term Recommendation

Proceed to M47 selection after M46 review.

### M45: Roadmap Backlog Refresh - Complete

Goal: re-assess the command-OS backlog after worker-backed Numbers, People, and Opportunity ingestion lifecycle coverage plus worker policy hardening.

Delivered capabilities:

- Current roadmap tail audited after M44 completion
- Production-readiness gaps refreshed after M41 commander authorization and M44 worker policy hardening
- Class-specific worker secret requirements reflected in production-readiness documentation
- Completed repo-side commander authorization and worker secret separation no longer listed as open roadmap gaps
- M46 selected as the next bounded production-operations follow-up
- Follow-on candidates scoped for live provider verification, operational runbooks, and future command-loop expansion
- No product behavior, backend route, server preference storage, approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/045-roadmap-backlog-refresh`
- Local validation covered roadmap consistency review, production-readiness gap review, code-review-and-quality gate, and diff hygiene

### M46: Production Operations Follow-up - Complete

Goal: convert remaining production-readiness gaps into concrete repo-side runbooks, environment verification checklists, and deployment/rollback evidence requirements without touching live provider state from the app request path.

Delivered capabilities:

- Production operations runbook added at `docs/production-operations.md`
- Pre-deploy evidence checklist for validation results, Git state, Netlify build shape, environment inventory, no-secret evidence, and rollback targets
- Netlify environment verification checklist for required, production-required, optional worker, live EVE SSO, and test-only variables
- Live EVE SSO provider verification checklist for callback URL, client id, scopes, authorized command sessions, and unauthorized corporation behavior
- MongoDB operations checklist for target database, least-privilege access, backups, restore expectations, index posture, and retention expectations
- Monitoring and alerting ownership checklist for deploys, functions, browser runtime, MongoDB, EVE SSO, worker authorization, retries, ingestion, and handoffs
- Worker secret rotation posture for class-specific callback secrets and shared fallback migration
- Deploy smoke, rollback procedure, and go/no-go record requirements that preserve production data
- Production readiness now links operators to the M46 runbook while preserving the conditional readiness verdict
- No product behavior, live deployment, backend route, server preference storage, approval mutation, queue creation, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution

Validation:

- Spec: `specs/046-production-operations-followup`
- Local validation covered full local command gate, production-operations documentation review, code-review-and-quality gate, and diff hygiene

Recommended next slice:

- M47: Operations Health Surface. Add a read-only commander-facing health summary for configured command APIs, ingestion histories, retry posture, and worker readiness using server-safe status data. It must not expose secrets, dispatch workers, call live providers from the browser, or mutate EVE/external services.

Recommended next-slice candidates:

- M47: Operations Health Surface. Add a read-only commander-facing health summary for configured command APIs, ingestion histories, retry posture, and worker readiness using server-safe status data. It must not expose secrets, dispatch workers, call live providers from the browser, or mutate EVE/external services.
- M48: Live Read Consent Expansion. Extend explicit ESI read-consent planning for narrowly scoped read-only corporation data sources after production operations posture is documented. It must keep token material server-side, require commander consent, and avoid EVE writes or player-impacting mutation.
- M49: Production Evidence Recorder. Add a server-side, operator-only record shape for value-free deployment evidence after the health surface exists. It must store no secrets, tokens, connection strings, cookies, JWTs, or production record exports.
