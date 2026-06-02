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

## Near-Term Recommendation

Proceed to M10 selection after M9 review.

The next slice should build on live authenticated command scope, the numbers/people/opportunity operating surfaces, auditable queue handoff, and the validation loop now in place.

Recommended next-slice candidates:

- Worker polling/claim/completion callbacks for prepared handoff records.
- Decision or queue creation from Numbers follow-up candidates.
- Explicit-consent ESI token vaulting and scoped read sync for future live data ingestion.
