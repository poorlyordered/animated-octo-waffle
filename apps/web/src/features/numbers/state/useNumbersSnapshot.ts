import { useEffect, useState } from 'react';
import type {
  CreateNumbersFollowUpDecisionRequest,
  CreateNumbersFollowUpQueueRequest,
  NumbersFollowUpDecisionResponse,
  NumbersFollowUpQueueResponse,
  NumbersLiveProvenance,
  NumbersSnapshot
} from '@gryyk/contracts';
import { createNumbersFollowUpDecision, createNumbersFollowUpQueue, getNumbersSnapshot } from '../services/numbersClient';

interface NumbersState {
  error: string | null;
  liveProvenance: NumbersLiveProvenance | null;
  loading: boolean;
  snapshot: NumbersSnapshot | null;
  createDecision: (
    candidateId: string,
    request: CreateNumbersFollowUpDecisionRequest
  ) => Promise<NumbersFollowUpDecisionResponse>;
  createQueue: (candidateId: string, request: CreateNumbersFollowUpQueueRequest) => Promise<NumbersFollowUpQueueResponse>;
}

export function useNumbersSnapshot(focus = 'corporation'): NumbersState {
  const [state, setState] = useState<Omit<NumbersState, 'createDecision' | 'createQueue'>>({
    error: null,
    liveProvenance: null,
    loading: true,
    snapshot: null
  });

  useEffect(() => {
    let active = true;

    getNumbersSnapshot(focus)
      .then(({ liveProvenance, snapshot }) => {
        if (!active) {
          return;
        }

        setState({ error: null, liveProvenance: liveProvenance ?? null, loading: false, snapshot });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : 'Unable to load numbers snapshot.',
          liveProvenance: null,
          loading: false,
          snapshot: null
        });
      });

    return () => {
      active = false;
    };
  }, [focus]);

  return {
    ...state,
    createDecision: createNumbersFollowUpDecision,
    createQueue: createNumbersFollowUpQueue
  };
}
