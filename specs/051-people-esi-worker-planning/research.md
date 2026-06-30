# Research: M51 People ESI Worker Planning

## Decision: external completion instead of in-function People ESI fetch

Rationale: the constitution requires long-running work outside request/response functions. A trusted worker can perform People ESI ingestion externally and submit safe result summaries through a worker-only callback.

Rejected alternative: add People ESI fetching to `/api/esi-sync-worker/:id/run`. That would expand request-path side effects and token handling beyond this slice.

## Decision: keep Opportunity queued requests planning-only

Rationale: M51 is specifically People ESI worker planning. Opportunity ESI execution needs its own domain-specific worker contract later.

Rejected alternative: make every prepared ESI domain claimable. That would blur worker ownership and expand scope without tests or domain rules.

## Decision: reuse ESI sync worker class secret

Rationale: People ESI sync requests are part of the ESI sync lifecycle, not the existing non-ESI People ingestion worker class. Reusing `esi_sync` callback authorization keeps token-vault sync work behind the existing class boundary.
