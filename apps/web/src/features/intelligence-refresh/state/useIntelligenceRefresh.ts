import { useCallback, useEffect, useState } from 'react';
import type {
  CreateIntelligenceRefreshRunResponse,
  IntelligenceRefreshDomain,
  IntelligenceRefreshRunSummary
} from '@gryyk/contracts';
import { createIntelligenceRefreshRun, listIntelligenceRefreshRuns } from '../services/intelligenceRefreshClient';

interface IntelligenceRefreshState {
  error: string | null;
  loading: boolean;
  runs: IntelligenceRefreshRunSummary[];
  createRun: (domains: IntelligenceRefreshDomain[], reason?: string) => Promise<CreateIntelligenceRefreshRunResponse>;
  refresh: () => Promise<IntelligenceRefreshRunSummary[]>;
}

export function useIntelligenceRefresh(): IntelligenceRefreshState {
  const [state, setState] = useState<Omit<IntelligenceRefreshState, 'createRun' | 'refresh'>>({
    error: null,
    loading: true,
    runs: []
  });

  const refresh = useCallback(async () => {
    const response = await listIntelligenceRefreshRuns();
    setState({ error: null, loading: false, runs: response.runs });
    return response.runs;
  }, []);

  useEffect(() => {
    let active = true;

    listIntelligenceRefreshRuns()
      .then((response) => {
        if (active) {
          setState({ error: null, loading: false, runs: response.runs });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            error: error instanceof Error ? error.message : 'Unable to load intelligence refresh runs.',
            loading: false,
            runs: []
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    refresh,
    createRun: async (domains, reason) => {
      const response = await createIntelligenceRefreshRun({ domains, reason });
      await refresh();
      return response;
    }
  };
}
