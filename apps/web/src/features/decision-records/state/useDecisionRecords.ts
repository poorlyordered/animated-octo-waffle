import { useCallback, useEffect, useState } from 'react';
import type { CreateDecisionRecordRequest, DecisionRecord, DecisionRecordListResponse, UpdateDecisionStatusRequest } from '@gryyk/contracts';
import {
  createDecisionRecord,
  listDecisionRecords,
  type ListDecisionRecordFilters,
  updateDecisionStatus
} from '../services/decisionRecordClient';

interface DecisionRecordsState {
  decisions: DecisionRecord[];
  loading: boolean;
  error: string | null;
  pagination: DecisionRecordListResponse['pagination'];
  selectedDecision: DecisionRecord | null;
}

interface UseDecisionRecordsState extends DecisionRecordsState {
  createDecision: (request: CreateDecisionRecordRequest) => Promise<DecisionRecord>;
  loadDecisions: (filters?: ListDecisionRecordFilters) => Promise<void>;
  updateStatus: (decisionId: string, request: UpdateDecisionStatusRequest) => Promise<DecisionRecord>;
  selectDecision: (decision: DecisionRecord | null) => void;
}

export function useDecisionRecords(): UseDecisionRecordsState {
  const [state, setState] = useState<DecisionRecordsState>({
    decisions: [],
    loading: true,
    error: null,
    pagination: {
      endIndex: 0,
      page: 1,
      pageSize: 5,
      startIndex: 0,
      totalItems: 0,
      totalPages: 1
    },
    selectedDecision: null
  });

  const loadDecisions = useCallback(async (filters: ListDecisionRecordFilters = {}): Promise<void> => {
    try {
      const { decisions, pagination } = await listDecisionRecords(filters);

      setState((current) => {
        const refreshedSelection = current.selectedDecision
          ? decisions.find((decision) => decision.id === current.selectedDecision?.id)
          : undefined;

        return {
          ...current,
          decisions,
          pagination,
          selectedDecision: refreshedSelection ?? decisions[0] ?? null,
          loading: false,
          error: null
        };
      });
    } catch (error: unknown) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load decision records.'
      }));
    }
  }, []);

  useEffect(() => {
    void loadDecisions();
  }, [loadDecisions]);

  const createDecision = useCallback(async (request: CreateDecisionRecordRequest): Promise<DecisionRecord> => {
    const { decision } = await createDecisionRecord(request);

    setState((current) => ({
      ...current,
      decisions: [decision, ...current.decisions.filter((item) => item.id !== decision.id)],
      pagination: {
        ...current.pagination,
        endIndex: Math.min(current.pagination.endIndex + 1, current.pagination.pageSize),
        totalItems: current.pagination.totalItems + 1,
        totalPages: Math.max(1, Math.ceil((current.pagination.totalItems + 1) / current.pagination.pageSize))
      },
      selectedDecision: decision,
      error: null
    }));

    return decision;
  }, []);

  const updateStatus = useCallback(async (decisionId: string, request: UpdateDecisionStatusRequest): Promise<DecisionRecord> => {
    const { decision } = await updateDecisionStatus(decisionId, request);

    setState((current) => ({
      ...current,
      decisions: current.decisions.map((item) => (item.id === decision.id ? decision : item)),
      selectedDecision: current.selectedDecision?.id === decision.id ? decision : current.selectedDecision,
      error: null
    }));

    return decision;
  }, []);

  const selectDecision = useCallback((decision: DecisionRecord | null) => {
    setState((current) => ({ ...current, selectedDecision: decision }));
  }, []);

  return {
    ...state,
    createDecision,
    loadDecisions,
    updateStatus,
    selectDecision
  };
}
