# Research: Intelligence Refresh Runs

## Decision: add a durable refresh-run orchestration record

**Rationale**: Existing ESI sync requests, People ingestion requests, Opportunity ingestion requests, and Brain runs each track their own lifecycle, but none answers the commander-level question "what refresh did I ask for, what data changed, and what evaluation used it?" A dedicated `intelligence_refresh_runs` record gives the command center one auditable lifecycle with per-domain step links and final evaluation linkage.

**Alternatives considered**:

- Reuse `research_requests` for refresh runs. Rejected because Brain/research lifecycle status is too narrow and does not model multiple domain steps.
- Use only existing worker request records. Rejected because the commander would still need to mentally join Numbers, People, Opportunity, and Brain state.

## Decision: browser creates records only; workers own execution

**Rationale**: The constitution requires long-running AI, research, sync, and enrichment work outside request/response paths. Commander APIs can create a run, prepare/link eligible request records, and read status, but ESI collection, People/Opportunity ingestion, and Brain evaluation remain worker-owned callbacks.

**Alternatives considered**:

- Start ESI pulls directly from the browser API. Rejected because it would put long-running token-using work in a request path.
- Dispatch workers from Netlify Functions. Rejected for the first slice because existing project boundaries currently prepare work and expose claim/callback endpoints rather than owning a scheduler.

## Decision: coordinate existing domain lifecycles by link, not by duplication

**Rationale**: Numbers already has `esi_sync_requests`; People and Opportunity have ingestion histories and worker callbacks; Brain has `research_requests` and generated `research_briefs`. Refresh steps should link to these records and store safe summaries so each subsystem remains independently testable.

**Alternatives considered**:

- Copy each worker record into the refresh document. Rejected because duplicated status can drift and increases migration risk.
- Replace existing worker endpoints with refresh-specific endpoints. Rejected because it would invalidate working slices and expand blast radius.

## Decision: allow explicit partial evaluation state

**Rationale**: Corporation data can be incomplete. A useful command system should evaluate what it has while making missing or stale domains explicit. The run policy should distinguish completed, completed-with-warnings, blocked, failed, and evaluation-ready states.

**Alternatives considered**:

- Require all domains to complete before any Brain evaluation. Rejected because one unavailable domain could block all command intelligence.
- Always evaluate immediately. Rejected because it would hide freshness and missing-data risk.

## Decision: start with a command-center panel, not a generic chat interface

**Rationale**: Chat may later become a commander control surface, but M59 is the underlying refresh lifecycle. A structured panel and API make run state, worker state, provenance, and approval boundaries inspectable before adding conversational commands.

**Alternatives considered**:

- Adopt a chatbot template as the first slice. Rejected because it would not solve durable orchestration and risks bypassing typed command contracts.
- Integrate Hermes-agent directly into the app. Rejected for M59 because Hermes-like orchestration should claim typed work through worker contracts rather than run inside browser APIs.
