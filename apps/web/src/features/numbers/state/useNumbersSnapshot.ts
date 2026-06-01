import { useEffect, useState } from 'react';
import type { NumbersSnapshot } from '@gryyk/contracts';
import { getNumbersSnapshot } from '../services/numbersClient';

interface NumbersState {
  error: string | null;
  loading: boolean;
  snapshot: NumbersSnapshot | null;
}

export function useNumbersSnapshot(focus = 'corporation'): NumbersState {
  const [state, setState] = useState<NumbersState>({
    error: null,
    loading: true,
    snapshot: null
  });

  useEffect(() => {
    let active = true;

    getNumbersSnapshot(focus)
      .then(({ snapshot }) => {
        if (!active) {
          return;
        }

        setState({ error: null, loading: false, snapshot });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : 'Unable to load numbers snapshot.',
          loading: false,
          snapshot: null
        });
      });

    return () => {
      active = false;
    };
  }, [focus]);

  return state;
}
