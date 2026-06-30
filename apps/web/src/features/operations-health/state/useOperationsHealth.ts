import { useEffect, useState } from 'react';
import type { OperationsHealthResponse } from '@gryyk/contracts';
import { getOperationsHealth } from '../services/operationsHealthClient';

interface OperationsHealthState {
  error: string | null;
  health: OperationsHealthResponse | null;
  loading: boolean;
}

export function useOperationsHealth(): OperationsHealthState {
  const [state, setState] = useState<OperationsHealthState>({
    error: null,
    health: null,
    loading: true
  });

  useEffect(() => {
    let active = true;

    getOperationsHealth()
      .then((health) => {
        if (active) {
          setState({ error: null, health, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            error: error instanceof Error ? error.message : 'Unable to load operations health.',
            health: null,
            loading: false
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
