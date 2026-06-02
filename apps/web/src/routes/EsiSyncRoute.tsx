import { EsiSyncPanel } from '../features/esi-sync/components/EsiSyncPanel';
import { useEsiSync } from '../features/esi-sync/state/useEsiSync';

export function EsiSyncRoute() {
  const esiSync = useEsiSync();

  return (
    <EsiSyncPanel
      error={esiSync.error}
      loading={esiSync.loading}
      status={esiSync.status}
      onPrepareSync={esiSync.prepareSync}
      onRevokeVault={esiSync.revokeVault}
      onScheduleRetry={esiSync.scheduleRetry}
      onStartConsent={esiSync.startConsent}
    />
  );
}
