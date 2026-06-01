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

## Near-Term Recommendation

Proceed to M7 selection after M6 review.

The next slice should build on authenticated command scope and the validation loop now in place.

Recommended next-slice candidates:

- Worker handoff for queued automation records.
- Numbers operating layer for wallet/assets/logistics visibility.
- Live EVE SSO identity validation and token handling through a server-side adapter.
