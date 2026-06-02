import type { NumbersLiveProvenance, NumbersSnapshot } from '../../../packages/contracts/src/index';
import type { EsiSyncRequestDocument } from './esi-sync-request-store';
import { syncHistoryItem } from './esi-sync-request-store';

const readOnlyBoundary =
  'Read-only provenance. No ESI write, worker dispatch, retry, wallet, asset, contract, role, or external-service action was performed.';

export function latestNumbersLiveProvenance(
  snapshot: NumbersSnapshot | null,
  syncRequest: EsiSyncRequestDocument | null
): NumbersLiveProvenance {
  if (!snapshot) {
    return {
      mode: 'unavailable',
      sourceCount: 0,
      sectionStatuses: [],
      message: 'No processed Numbers snapshot is available for this corporation scope.',
      boundary: readOnlyBoundary
    };
  }

  const snapshotSectionStatuses = snapshot.sections.map((section) => ({ key: section.key, status: section.status }));

  if (!syncRequest) {
    return {
      mode: 'historical_snapshot',
      snapshotId: snapshot.id,
      snapshotCreatedAt: snapshot.createdAt,
      sourceCount: snapshot.provenance.sourceCount,
      sectionStatuses: snapshotSectionStatuses,
      message: 'Latest Numbers snapshot is processed historical data. Live ESI sync provenance is unavailable.',
      boundary: readOnlyBoundary
    };
  }

  return {
    mode: 'live_sync',
    syncRequestId: syncRequest.id ?? syncRequest._id?.toString() ?? '',
    snapshotId: snapshot.id,
    status: syncRequest.status,
    requestedAt: syncRequest.requestedAt,
    completedAt: syncRequest.completedAt,
    snapshotCreatedAt: snapshot.createdAt,
    sourceCount: syncRequest.result?.sourceCount ?? snapshot.provenance.sourceCount,
    sectionStatuses: syncRequest.result?.sectionStatuses.length ? syncRequest.result.sectionStatuses : snapshotSectionStatuses,
    message: 'Latest Numbers snapshot was produced by a completed read-only ESI sync.',
    boundary: readOnlyBoundary
  };
}

export function syncHistoryItems(syncRequests: EsiSyncRequestDocument[]) {
  return syncRequests.map(syncHistoryItem);
}
