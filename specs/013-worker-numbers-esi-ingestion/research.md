# Research: Worker Numbers ESI Ingestion

## Decision: Use Worker Callback Secret For Sync Worker Authorization

**Rationale**: The repo already has a trusted worker callback boundary. Reusing `WORKER_CALLBACK_SECRET` keeps M13 aligned with M10 and avoids introducing another secret policy.

**Alternatives considered**:

- Browser session authorization: rejected because ESI ingestion is worker-side automation.
- New sync-specific worker secret: deferred until multiple worker classes require separation.

## Decision: Write Processed Numbers Snapshots, Not Raw ESI Payloads

**Rationale**: The Numbers surface already consumes `numbers_snapshots`. Persisting processed summaries keeps storage bounded and avoids leaking raw ESI payloads into browser surfaces.

**Alternatives considered**:

- Store raw payloads in MongoDB: rejected because M13 only needs operating summaries and the constitution favors separable source capture/processing.
- Update Numbers UI to read ESI directly: rejected because live ESI work belongs outside browser request paths.

## Decision: Treat Partial ESI Failure As Stale Or Missing Sections

**Rationale**: The Numbers contract already supports stale/missing states. Partial failures should not fabricate healthy data, and the commander should see which sections were unavailable.

**Alternatives considered**:

- Fail the entire sync on one endpoint failure: rejected because partial Numbers data can still be useful if failure is explicit.
- Hide failed sections: rejected because missing data must be visible.

## Decision: Implement Numbers Domain Only

**Rationale**: M12 prepared extensible sync requests, but the roadmap’s next step is live Numbers ingestion. People and Opportunity ingestion should be separate slices with their own data contracts.

**Alternatives considered**:

- Implement all domains: rejected as too broad.
- Add generic ingestion without section semantics: rejected because Numbers needs stable wallet/assets/logistics/market/activity output.
