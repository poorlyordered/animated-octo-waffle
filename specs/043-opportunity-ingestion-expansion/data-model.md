# Data Model: M43 Opportunity Ingestion Expansion

## OpportunityResearchRequest

- `id`: browser-safe request id.
- `corporationId`: command corporation scope.
- `focus`: Opportunity research focus.
- `status`: `queued`, `processing`, `processed`, or `failed`.
- `requestedBy`: display-safe commander/session/source label.
- `createdAt` / `updatedAt`: audit timestamps.
- `claimedBy`: worker id when claimed.
- `claimedAt`: ISO timestamp when claimed.
- `result.sourceCount`: non-negative count of sources processed by the worker.
- `result.sectionStatuses`: sources, impacts, recommendations, and watchlist coverage states.
- `errorMessage`: safe failure reason for failed requests.
- `failedAt`: ISO timestamp for failed requests.

## Invariants

- Only one active queued/processing request is surfaced per corporation and focus by commander prepare.
- Worker claim only succeeds from `queued`.
- Worker completion/failure only succeeds for the claiming worker while status is `processing`.
- Browser-safe summaries never include secrets, tokens, raw provider payloads, prompt payloads, or external execution payloads.
