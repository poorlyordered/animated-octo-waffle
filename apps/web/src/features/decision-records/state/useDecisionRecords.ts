import { useEffect, useState } from 'react';
import type { CreateDecisionRecordRequest, DecisionRecord, UpdateDecisionStatusRequest } from '@gryyk/contracts';
import {
  createDecisionRecord,
  listDecisionRecords,
  updateDecisionStatus
} from '../services/decisionRecordClient';

interface DecisionRecordsState {
  decisions: DecisionRecord[];
  loading: boolean;
  error: string | null;
  selectedDecision: DecisionRecord | null;
}

interface UseDecisionRecordsState extends DecisionRecordsState {
  createDecision: (request: CreateDecisionRecordRequest) => Promise<DecisionRecord>;
  updateStatus: (decisionId: string, request: UpdateDecisionStatusRequest) => Promise<DecisionRecord>;
  selectDecision: (decision: DecisionRecord | null) => void;
}

export function useDecisionRecords(): UseDecisionRecordsState {
  const [state, setState] = useState<DecisionRecordsState>({
    decisions: [],
    loading: true,
    error: null,
    selectedDecision: null
  });

  useEffect(() => {
    let active = true;

    listDecisionRecords()
      .then(({ decisions }) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          decisions,
          selectedDecision: current.selectedDecision ?? decisions[0] ?? null,
          loading: false,
          error: null
        }));
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load decision records.'
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  async function createDecision(request: CreateDecisionRecordRequest): Promise<DecisionRecord> {
    const { decision } = await createDecisionRecord(request);

    setState((current) => ({
      ...current,
      decisions: [decision, ...current.decisions.filter((item) => item.id !== decision.id)],
      selectedDecision: decision,
      error: null
    }));

    return decision;
  }

  async function updateStatus(decisionId: string, request: UpdateDecisionStatusRequest): Promise<DecisionRecord> {
    const { decision } = await updateDecisionStatus(decisionId, request);

    setState((current) => ({
      ...current,
      decisions: current.decisions.map((item) => (item.id === decision.id ? decision : item)),
      selectedDecision: current.selectedDecision?.id === decision.id ? decision : current.selectedDecision,
      error: null
    }));

    return decision;
  }

  return {
    ...state,
    createDecision,
    updateStatus,
    selectDecision: (decision) => setState((current) => ({ ...current, selectedDecision: decision }))
  };
}
