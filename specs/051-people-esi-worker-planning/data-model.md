# Data Model: M51 People ESI Worker Planning

M51 reuses `esi_sync_requests` and does not add a collection.

## EsiSyncWorkerCompleteRequest

- `workerId`: trusted worker identifier.
- `result`: safe `EsiSyncWorkerResultSummary`.

## Supported Worker Domains

- `numbers`: list, claim, run, fail.
- `people`: list, claim, complete, fail.
- `opportunity`: still planning-only; not claimable or completable in M51.

## Result Summary Boundary

The result summary contains safe counts, section statuses, a short summary, and failures. It must not contain token material, raw ESI payloads, member exports, role/access mutation payloads, or execution handles.
