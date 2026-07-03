import { useCallback, useEffect, useState } from 'react';
import type {
  CreateIntelligenceRefreshRunResponse,
  IntelligenceRefreshDomain,
  IntelligenceRefreshMode,
  IntelligenceRefreshReadinessResponse,
  IntelligenceRefreshRunDetailResponse,
  IntelligenceRefreshRunSummary
} from '@gryyk/contracts';
import {
  createIntelligenceRefreshRun,
  getIntelligenceRefreshReadiness,
  getIntelligenceRefreshRun,
  listIntelligenceRefreshRuns,
  retryIntelligenceRefreshStep,
  skipIntelligenceRefreshStep
} from '../services/intelligenceRefreshClient';

interface IntelligenceRefreshState {
  error: string | null;
  loading: boolean;
  readiness: IntelligenceRefreshReadinessResponse | null;
  runs: IntelligenceRefreshRunSummary[];
  selectedRun: IntelligenceRefreshRunDetailResponse | null;
  createRun: (
    domains: IntelligenceRefreshDomain[],
    mode?: IntelligenceRefreshMode,
    reason?: string
  ) => Promise<CreateIntelligenceRefreshRunResponse>;
  loadRun: (runId: string) => Promise<IntelligenceRefreshRunDetailResponse>;
  refresh: () => Promise<IntelligenceRefreshRunSummary[]>;
  retryStep: (runId: string, stepId: string, reason: string) => Promise<void>;
  skipStep: (runId: string, stepId: string, reason: string) => Promise<void>;
}

export function useIntelligenceRefresh(): IntelligenceRefreshState {
  const [state, setState] = useState<Omit<IntelligenceRefreshState, 'createRun' | 'loadRun' | 'refresh' | 'retryStep' | 'skipStep'>>({
    error: null,
    loading: true,
    readiness: null,
    selectedRun: null,
    runs: []
  });

  const refresh = useCallback(async () => {
    const [readiness, response] = await Promise.all([getIntelligenceRefreshReadiness(), listIntelligenceRefreshRuns()]);
    setState((current) => ({ ...current, error: null, loading: false, readiness, runs: response.runs }));
    return response.runs;
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getIntelligenceRefreshReadiness(), listIntelligenceRefreshRuns()])
      .then(([readiness, response]) => {
        if (active) {
          setState({ error: null, loading: false, readiness, selectedRun: null, runs: response.runs });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            error: error instanceof Error ? error.message : 'Unable to load intelligence refresh runs.',
            loading: false,
            readiness: null,
            selectedRun: null,
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
    loadRun: async (runId) => {
      const detail = await getIntelligenceRefreshRun(runId);
      setState((current) => ({ ...current, selectedRun: detail }));
      return detail;
    },
    createRun: async (domains, mode = 'full_refresh', reason) => {
      const response = await createIntelligenceRefreshRun({ domains, mode, reason });
      await refresh();
      return response;
    },
    retryStep: async (runId, stepId, reason) => {
      await retryIntelligenceRefreshStep(runId, stepId, { reason });
      const detail = await getIntelligenceRefreshRun(runId);
      setState((current) => ({ ...current, selectedRun: detail }));
      await refresh();
    },
    skipStep: async (runId, stepId, reason) => {
      await skipIntelligenceRefreshStep(runId, stepId, { reason });
      const detail = await getIntelligenceRefreshRun(runId);
      setState((current) => ({ ...current, selectedRun: detail }));
      await refresh();
    }
  };
}
