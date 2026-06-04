# Research: Opportunity Ingestion Provenance

## Decision: Attach provenance to the command brief response

Rationale: Opportunity context currently lives in command briefs through strategic impacts, recommended actions, watchlist entries, and operating leg coverage. Returning provenance with `/api/command-brief` keeps the browser state aligned with the data it explains.

Alternatives considered:

- New standalone Opportunity route: rejected for M19 because there is no existing Opportunity product surface and the command brief already represents this workflow.
- Numbers opportunity list provenance: rejected because Numbers opportunities are a different processed snapshot field and not the research ingestion path.

## Decision: Use bounded `research_requests` history

Rationale: `research_requests` already captures queued, captured, processing, processed, and failed research states. Reading recent records by corporation and focus mirrors the Numbers and People provenance patterns without adding execution.

Alternatives considered:

- Add a research scheduling control: rejected because M19 is visibility only.
- Persist provenance on `research_briefs`: rejected because provenance can be computed from existing records.

## Decision: Compute section coverage from command brief content

Rationale: Sources, impacts, recommendations, and watchlist are the Opportunity-facing sections commanders inspect before decisions. Presence/missing status is simple, auditable, and browser-safe.

Alternatives considered:

- Use only confidence: rejected because confidence does not identify missing sections.
- Derive Opportunity coverage only from `OperatingLegCoverage`: rejected because it is too coarse for M19.

## Decision: Preserve no-execution language

Rationale: Research ingestion may become long-running or worker-driven later. M19 must make current history visible without scheduling research pulls, dispatching workers, fetching ESI, writing to EVE, or executing external services.
