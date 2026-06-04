# Data Model: Opportunity Ingestion Provenance

## OpportunityIngestionProvenance

- `mode`: `latest_research`, `historical_brief`, or `unavailable`
- `focus`: research focus used for the current command brief surface
- `sourceCount`: source count from processed research history or latest brief
- `briefCount`: number of processed briefs for the corporation/focus scope
- `sectionStatuses`: `sources`, `impacts`, `recommendations`, and `watchlist` statuses
- `history`: bounded recent `OpportunityIngestionHistoryItem[]`
- `message`: browser-safe commander-facing provenance summary
- `boundary`: no-execution language

Validation rules:

- Must not include secrets, tokens, worker credentials, dispatch targets, EVE write handles, or execution handles.
- `latest_research` requires at least one processed history item.
- `historical_brief` requires a command brief and no processed history item.
- `unavailable` is used when no processed history item and no command brief exist.

## OpportunityIngestionHistoryItem

- `id`: request id or document id
- `status`: `queued`, `raw_captured`, `processing`, `processed`, or `failed`
- `requestedAt`: ISO timestamp from request/create time
- `updatedAt`: ISO timestamp
- `requestedBy`: optional safe requester identifier
- `sourceCount`: optional non-negative source count from safe request/result metadata
- `failure`: optional browser-safe reason and failed timestamp
- `sectionStatuses`: safe result section statuses, falling back to command brief coverage when malformed or missing
- `boundary`: no-execution language

## Section Coverage

For the latest command brief:

- `sources`: present when source count or source references are available
- `impacts`: present when strategic impacts are available
- `recommendations`: present when recommended actions are available
- `watchlist`: present when watchlist entries are available

If no brief exists, all sections are missing.
