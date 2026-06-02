# Research: Worker Handoff Callbacks

## Decision: Add worker callbacks to the existing handoff API boundary

**Rationale**: M7 already exposes `/api/worker-handoffs` and stores durable `worker_handoffs` records. Adding claim/progress/complete/fail routes to this boundary keeps all handoff behavior in one module and avoids a parallel worker subsystem.

**Alternatives considered**: A separate worker service was considered, but M10 only needs bounded callback persistence and would add unnecessary deployment complexity.

## Decision: Use atomic MongoDB state transitions for claim

**Rationale**: Multiple workers may poll at the same time. Claim must update only records in `ready` status and return the updated document, so duplicate processing is avoided.

**Alternatives considered**: Read-then-write claim logic was rejected because it can race when two workers claim the same handoff.

## Decision: Use a server-side shared callback secret for M10

**Rationale**: M10 needs a small authorization boundary before adding richer worker identity infrastructure. A required `WORKER_CALLBACK_SECRET` header check gives local and deployment validation a concrete server-owned credential.

**Alternatives considered**: EVE SSO/session cookies do not fit non-browser workers. OAuth service accounts or signed worker tokens are better future options but out of scope for the first callback slice.

## Decision: Store safe progress/result summaries only

**Rationale**: Commander-facing handoff reads must show progress, completion, and failure without exposing raw worker logs, tokens, provider payloads, or credentials. M10 stores bounded summaries, status codes, and timestamps.

**Alternatives considered**: Storing raw callback payloads would improve debugging, but it risks secret exposure and violates the browser-safe handoff contract.

## Decision: No retry or external dispatch in M10

**Rationale**: The roadmap separates handoff callbacks from worker scheduling/retry policy. M10 records state transitions only; future slices can decide how retry policy should work with explicit commander visibility.

**Alternatives considered**: Automatic retry on failure was rejected because it can become player-impacting or externally mutating without an explicit approval model.
