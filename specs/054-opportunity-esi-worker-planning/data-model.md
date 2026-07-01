# Data Model: M54 Opportunity ESI Worker Planning

M54 reuses `esi_sync_requests` and does not add a collection.

## ESI Sync Worker Domain Policy

- `numbers`: list, claim, run, fail.
- `people`: list, claim, complete, fail.
- `opportunity`: list, claim, complete, fail.

## Opportunity Worker Result Summary

Opportunity external completion uses the existing `EsiSyncWorkerResultSummary`:

- `snapshotId?`: optional downstream snapshot or artifact id
- `sourceCount`: number of processed safe sources
- `summary`: value-free completion summary
- `sectionStatuses`: safe section key/status summaries
- `failures`: safe failure descriptions

Unsafe token, secret, raw payload, dispatch, retry, wallet, role, or access mutation material is rejected before storage.
