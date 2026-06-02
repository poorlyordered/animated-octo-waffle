# Data Model: Sync History Provenance

## EsiSyncHistoryItem

Browser-safe recent sync request summary for the active corporation scope.

### Fields

- `id`: Sync request identifier.
- `domain`: Sync domain, initially `numbers`.
- `status`: Request status: queued, claimed, completed, failed, or cancelled.
- `requestedAt`: Request creation timestamp.
- `claimedBy`: Optional worker identifier safe for display.
- `claimedAt`: Optional claim timestamp.
- `completedAt`: Optional completion timestamp.
- `snapshotId`: Optional linked Numbers snapshot id.
- `sourceCount`: Optional count of summarized source groups.
- `sectionStatuses`: Section key/status summaries from worker result metadata.
- `failure`: Optional safe failure reason and failed timestamp.
- `boundary`: Read-only/no-execution boundary language.

## NumbersLiveProvenance

Latest browser-safe live sync context for the Numbers surface.

### Fields

- `mode`: `live_sync`, `historical_snapshot`, or `unavailable`.
- `syncRequestId`: Completed sync request id when available.
- `snapshotId`: Numbers snapshot id when available.
- `status`: Latest sync status when available.
- `requestedAt`: Sync request timestamp when available.
- `completedAt`: Sync completion timestamp when available.
- `snapshotCreatedAt`: Snapshot creation timestamp when available.
- `sourceCount`: Source count from sync result or snapshot provenance.
- `sectionStatuses`: Wallet, assets, logistics, market, and activity status summaries.
- `message`: Browser-visible summary of provenance state.
- `boundary`: Read-only/no-execution boundary language.

## NumbersSnapshot

Existing processed corporation health record.

### M14 Requirements

- Can be displayed with linked completed ESI sync provenance when the sync request result references its snapshot id.
- Can still be displayed as historical processed data when no sync linkage exists.
- Must not expose raw ESI payloads, token material, worker secrets, dispatch targets, retry schedules, or external execution handles.

## EsiSyncRequest

Existing worker sync request record.

### M14 Requirements

- Read recent scoped records for history.
- Read completed records that link to the latest Numbers snapshot for live provenance.
- Do not mutate request state in M14.
