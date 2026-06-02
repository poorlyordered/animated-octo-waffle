import { useCallback, useEffect, useState } from 'react';
import type {
  EsiSyncDomain,
  EsiSyncStatusResponse,
  PrepareEsiSyncResponse,
  RevokeEsiVaultResponse,
  ScheduleRetryResponse,
  StartEsiSyncConsentResponse
} from '@gryyk/contracts';
import { getEsiSyncStatus, prepareEsiSync, revokeEsiVault, scheduleEsiSyncRetry, startEsiSyncConsent } from '../services/esiSyncClient';

interface EsiSyncState {
  error: string | null;
  loading: boolean;
  status: EsiSyncStatusResponse | null;
  prepareSync: (domain: EsiSyncDomain) => Promise<PrepareEsiSyncResponse>;
  revokeVault: () => Promise<RevokeEsiVaultResponse>;
  scheduleRetry: (syncRequestId: string, reason: string) => Promise<ScheduleRetryResponse>;
  startConsent: () => Promise<StartEsiSyncConsentResponse>;
}

export function useEsiSync(): EsiSyncState {
  const [state, setState] = useState<Omit<EsiSyncState, 'prepareSync' | 'revokeVault' | 'scheduleRetry' | 'startConsent'>>({
    error: null,
    loading: true,
    status: null
  });

  const refresh = useCallback(async () => {
    const status = await getEsiSyncStatus();
    setState({ error: null, loading: false, status });
    return status;
  }, []);

  useEffect(() => {
    let active = true;

    getEsiSyncStatus()
      .then((status) => {
        if (active) {
          setState({ error: null, loading: false, status });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            error: error instanceof Error ? error.message : 'Unable to load ESI sync state.',
            loading: false,
            status: null
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    prepareSync: async (domain) => {
      const response = await prepareEsiSync({ domain });
      await refresh();
      return response;
    },
    revokeVault: async () => {
      const response = await revokeEsiVault();
      setState((current) => ({
        ...current,
        status: current.status ? { ...current.status, vault: response.vault } : current.status
      }));
      return response;
    },
    scheduleRetry: async (syncRequestId, reason) => {
      const response = await scheduleEsiSyncRetry(syncRequestId, { reason });
      await refresh();
      return response;
    },
    startConsent: () => startEsiSyncConsent({ returnTo: '/' })
  };
}
