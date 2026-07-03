# Gryyk-47 Greenfield — architecture overview

Generated onboarding doc. Diagrams are Mermaid — they render natively on GitHub.

Gryyk-47 is a command operating system for an EVE Online corporation. The core design
constraint, repeated throughout the codebase: the **browser is a command and review
surface only**. It never dispatches workers, fetches ESI, writes to EVE, or calls
external services. All execution happens through trusted workers authenticating with
callback secrets, and all player-impacting work is gated behind explicit commander
approval of decision records.

## System context

```mermaid
flowchart TB
    Commander["Commander (browser user)"]
    Workers["Trusted external workers\n(handoff / retry / ESI sync /\ningestion / Brain)"]
    App["Gryyk-47\n(React SPA + Netlify Functions)"]
    Mongo[("MongoDB Atlas")]
    EveSSO["EVE SSO\n(OAuth2 + JWKS)"]
    ESI["EVE ESI API\n(read-only)"]
    OpenRouter["OpenRouter\n(LLM Brain)"]

    Commander -->|"signed HTTP-only session cookie"| App
    Workers -->|"worker callback secrets"| App
    App --> Mongo
    App -->|"auth code exchange, JWT validation"| EveSSO
    App -->|"read-only identity lookup +\nworker-run Numbers ingestion"| ESI
    App -->|"Brain worker endpoint only\n(server-side key)"| OpenRouter
```

The commander signs in via EVE SSO; sessions are authorized only for corporations in a
server-owned allowlist (`EVEONLINE_CORPORATION_ID` / `EVEONLINE_AUTHORIZED_CORPORATION_IDS`).
Workers are external processes that poll worker-only API endpoints; the app never pushes
work to them.

## Containers

```mermaid
flowchart TB
    subgraph Netlify["Netlify"]
        Web["@gryyk/web\nReact 19 + Vite SPA\napps/web"]
        Fns["Netlify Functions (API)\nnetlify/functions/*.ts\n/api/* → /.netlify/functions/*"]
    end
    Contracts["@gryyk/contracts\nZod schemas shared by\nweb + functions\npackages/contracts"]
    Mongo[("MongoDB\nresearch_briefs, strategic_decisions,\nautomation_queue, worker_handoffs,\nretry_requests, numbers_snapshots,\nmember_profiles, leadership_followups,\nesi_token_vaults, esi_sync_requests")]
    External["EVE SSO / ESI / OpenRouter"]

    Web -->|"fetch /api/*"| Fns
    Web -.->|imports| Contracts
    Fns -.->|imports| Contracts
    Fns --> Mongo
    Fns --> External
```

- **@gryyk/web** — the command center UI. One route per surface (Command Brief,
  Decision Records, Automation Queue, Numbers, Opportunity, People, ESI Sync,
  Operations Health, Production Evidence), each backed by a feature module in
  `apps/web/src/features/`.
- **Netlify Functions** — one function per surface plus worker callback endpoints
  (`*-worker.ts`) and EVE SSO endpoints. Shared logic (Mongo access, auth scope,
  normalizers, per-domain stores, worker callback auth) lives in
  `netlify/functions/_shared/`.
- **@gryyk/contracts** — Zod schemas defining every API payload; both sides validate
  against the same definitions.

## Data model

MongoDB (document store) — no migrations, so this is reconstructed from the store
modules in `netlify/functions/_shared/` and the README. Not exhaustive; shows the
central decision/execution chain and the domain collections.

```mermaid
erDiagram
    strategic_decisions ||--o{ automation_queue : "approved decision gates queued work"
    automation_queue ||--o{ worker_handoffs : "eligible queue item gets handoff"
    worker_handoffs ||--o{ retry_requests : "failed handoff can schedule retry"
    esi_sync_requests ||--o{ retry_requests : "failed sync can schedule retry"
    esi_token_vaults ||--o{ esi_sync_requests : "active vault prepares read-sync"
    research_briefs ||--o{ strategic_decisions : "brief sources decisions"
    research_requests ||--o{ research_briefs : "processed request yields brief"
    member_profiles ||--o{ leadership_followups : "profile grounds follow-up"
    leadership_followups ||--o{ strategic_decisions : "follow-up proposes decision"
    esi_sync_requests ||--o{ numbers_snapshots : "completed Numbers sync writes snapshot"
```

Key invariants enforced in the store/rules modules: queue records require an approved
decision; only one active scheduled retry per target; vault token material is sealed
server-side (`ESI_TOKEN_VAULT_SEALING_KEY`) and never returned to the browser.

## Key flows

### EVE SSO sign-in

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as eve-sso-start
    participant E as EVE SSO
    participant C as eve-sso-callback
    participant ESI as EVE ESI

    B->>S: GET /api/eve-sso-start
    S-->>B: redirect to EVE authorize URL + signed state cookie
    B->>E: authorize (character login)
    E-->>B: redirect with auth code
    B->>C: GET /api/eve-sso-callback?code=...
    C->>E: exchange code (server-side client secret)
    E-->>C: access token (JWT)
    C->>E: validate JWT against SSO metadata/JWKS
    C->>ESI: read-only character → corporation lookup
    C->>C: check corporation against server allowlist
    C-->>B: signed HTTP-only session cookie (identity only, no tokens)
```

In production (`NODE_ENV=production` or Netlify `CONTEXT=production`) all command APIs
require this signed session; locally, `EVEONLINE_CORPORATION_ID` provides a no-session
fallback scope for fixtures and tests.

### Decision → queue → worker handoff lifecycle

```mermaid
sequenceDiagram
    participant Cmd as Commander (browser)
    participant API as Netlify Functions
    participant DB as MongoDB
    participant W as Trusted worker

    Cmd->>API: record proposed decision (from Numbers/Opportunity/People)
    API->>DB: strategic_decisions (proposed)
    Cmd->>API: approve decision
    API->>DB: strategic_decisions (approved)
    Cmd->>API: create queued work
    API->>DB: automation_queue (linked to approved decision)
    Cmd->>API: prepare worker handoff
    API->>DB: worker_handoffs (ready) — metadata only, nothing dispatched
    W->>API: list ready handoffs (worker callback secret)
    W->>API: atomically claim one handoff
    W->>W: execute work externally
    W->>API: complete or fail with safe summary
    API->>DB: audit metadata
    Cmd->>API: on failure — schedule/reschedule/cancel retry
    API->>DB: retry_requests
```

Every step is a separate explicit commander action; approval never auto-creates queue
work, and preparation never auto-dispatches.

## Deployment

```mermaid
flowchart LR
    Dev["git push / PR merge"] --> NB["Netlify build\nnpm run build\n(contracts → web)"]
    NB --> CDN["Netlify CDN\napps/web/dist (SPA)"]
    NB --> FN["Netlify Functions\nnetlify/functions"]
    CDN -->|"/api/* redirect"| FN
    FN --> Atlas[("MongoDB\nMONGODB_URI / MONGODB_DB")]
    FN --> Ext["EVE SSO / ESI / OpenRouter"]
```

Single Netlify site: static SPA plus functions, wired by the `/api/*` redirect in
`netlify.toml`. Secrets (Mongo, worker callback secrets, EVE SSO client secret,
OpenRouter key, vault sealing key) are server-side Netlify env vars — never `VITE_*`.
Local development mirrors this with `npm run dev:netlify` on port 8888.

## Codebase map

```
apps/web/              React 19 + Vite command-center SPA
  src/routes/          One route component per command surface
  src/features/        Feature modules (command-brief, decision-records, numbers,
                       opportunity, people, esi-sync, automation-queue,
                       operations-health, production-evidence, retry-audit, session)
  e2e/, tests/         Playwright smoke tests and web unit tests
netlify/functions/     API endpoints, one file per surface or worker callback
  _shared/             Mongo client, auth scope, session cookies, EVE SSO,
                       per-domain stores/normalizers/rules, worker callback auth
packages/contracts/    @gryyk/contracts — Zod schemas for every API payload
docs/                  roadmap, production readiness/operations, worker policy
specs/                 Spec Kit feature specs (numbered milestones, e.g. 057-...)
.specify/              Spec Kit constitution and memory
.agents/               Agent skill definitions for the spec workflow
netlify.toml           Build config + /api/* → functions redirect
playwright.config.ts   E2E config (deterministic fixtures, no live credentials)
jest.config.cjs        Contract/unit tests run in Node
```

## Open questions

- The ERD is inferred from store modules and README prose, not a schema — field-level
  relationships (e.g. exactly how `retry_requests` references its target) should be
  confirmed against `_shared/*-store.ts`.
- The README mentions a broader legacy `gryyk47` database alongside the runtime
  `MONGODB_DB`; whether any runtime path reads it wasn't verified here.
- `brain-worker.ts` (OpenRouter Brain) writes `research_briefs`/`research_requests` —
  the exact trigger cadence for Brain runs (manual worker? scheduled externally?) is
  worker-owned and not visible in this repo.
- Production Evidence records presumably live in their own collection
  (`production-evidence-store.ts`); the collection name wasn't confirmed.
