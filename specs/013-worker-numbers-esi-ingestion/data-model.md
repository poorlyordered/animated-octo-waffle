# Data Model: Worker Numbers ESI Ingestion

## EsiSyncRequest

Prepared worker record for read-only ESI sync.

### Added M13 Fields

- `claimedBy`: Worker identifier.
- `claimedAt`: Claim timestamp.
- `completedAt`: Completion timestamp.
- `failure`: Safe failure summary.
- `result`: Safe result summary including `snapshotId`, section statuses, and source count.

### State Transitions

```text
queued -> claimed -> completed
queued -> claimed -> failed
```

M13 does not schedule retries.

## EsiNumbersIngestionResult

Safe worker output from read-only ESI ingestion.

### Fields

- `snapshotId`: Created Numbers snapshot id.
- `sections`: Section key/status summaries.
- `sourceCount`: Number of ESI source groups summarized.
- `summary`: Safe completion summary.
- `failures`: Safe endpoint failure summaries.

## NumbersSnapshot

Existing processed corporation health record.

### M13 Requirements

- `focus`: `corporation`
- `sections`: Wallet, assets, logistics, market, and activity
- `provenance`: Source count, source references, confidence, model/prompt metadata, and created timestamp
- `observations`: Basic safe observations from read-only ESI data
- `risks`: Missing/stale section notes
- `opportunities`: Market/industry observations when available
- `followUps`: Display-only candidates when missing data requires commander attention

## EsiTokenVault

Existing M12 vault record. M13 reads active same-corporation vaults and unseals tokens only inside server-side worker helpers.
