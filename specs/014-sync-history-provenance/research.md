# Research: Sync History Provenance

## Decision: Read From Existing Sync And Snapshot Records

**Rationale**: M13 already writes `esi_sync_requests` status/result/failure metadata and `numbers_snapshots` records. M14 can expose provenance by joining safe summaries from these existing records without adding a new persistence layer.

**Alternatives considered**: Add a dedicated history collection. Rejected because it would duplicate request status and increase drift risk.

## Decision: Bounded Recent History

**Rationale**: The commander needs recent auditability, not an unbounded archive in the first slice. A small default limit keeps request-path reads predictable and supports future pagination if needed.

**Alternatives considered**: Full paginated history. Rejected for M14 because the roadmap need is latest live provenance and recent sync visibility; pagination can be added when real usage requires it.

## Decision: Browser-Safe Normalization Layer

**Rationale**: Existing sync request and snapshot records may contain worker metadata and internal fields. A dedicated normalizer keeps browser responses limited to status, timestamps, source count, section health, result/failure summaries, snapshot ids, and boundary language.

**Alternatives considered**: Return store records directly. Rejected because it risks exposing internal worker, vault, or persistence fields and weakens the secret-free response contract.

## Decision: Read-Only UI With No Retry Controls

**Rationale**: Retry policy and commander-approved retry scheduling are separate roadmap candidates. M14 should not imply execution authority or create worker dispatch behavior before that policy exists.

**Alternatives considered**: Add a retry button next to failed syncs. Rejected because it would cross the automation boundary and require approval/retry semantics not specified for M14.
