# Research: People Ingestion Provenance

## Decision: Use optional provenance on the member list response

Rationale: The People route already loads member profiles before rendering the command surface. Returning provenance with that response keeps the browser state aligned with the data it explains and avoids a second request.

Alternatives considered:

- Separate `/api/people/ingestion-history` endpoint: rejected for M18 because it would add routing and state complexity without independent workflow value.
- Detail-only provenance: rejected because the provenance applies to the list-level profile dataset, not one member.

## Decision: Read bounded `people_ingestion_requests` history

Rationale: M18 is a visibility slice, not an ingestion worker slice. A bounded read of recent corporation-scoped history mirrors the Numbers sync history pattern while keeping request work short.

Alternatives considered:

- Add a People ingestion worker: rejected as future work because it would expand M18 into execution and token/worker handling.
- Persist computed provenance on member profiles: rejected because provenance can be derived from existing history plus coverage.

## Decision: Aggregate section status from member coverage

Rationale: Existing `MemberProfile.coverage` already captures identity, roles, activity, and delegation state. Aggregating missing before stale before present gives commanders a conservative data-quality signal.

Alternatives considered:

- Use only ingestion result section status: rejected because history may be absent or partial.
- Show a single confidence score: rejected because People operations need specific gaps, not generic confidence.

## Decision: Keep browser text read-only and no-execution

Rationale: People provenance can be adjacent to player-impacting role and access workflows. The panel must make clear that it does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.
