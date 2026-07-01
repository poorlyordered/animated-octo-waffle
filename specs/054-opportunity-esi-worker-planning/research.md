# Research: M54 Opportunity ESI Worker Planning

## Decision: extend the ESI sync worker domain policy

Rationale: M51 established the worker-owned lifecycle for People ESI sync. Opportunity ESI sync should follow the same externally completed pattern rather than adding in-process request-path ESI fetching.

Rejected alternative: add Opportunity ESI fetching to `/api/esi-sync-worker/:id/run`. That would expand request-path side effects and token handling beyond this slice.

## Decision: reuse the existing completion schema

Rationale: `EsiSyncWorkerResultSummary` already captures safe source counts, section status summaries, failures, and optional snapshot ids without exposing raw ESI data or secrets.

## Decision: keep Numbers-only run behavior

Rationale: Numbers ingestion has an existing in-process implementation. People and Opportunity remain externally completed by trusted workers so long-running work stays outside app request/response paths.
