import { useEffect, useMemo, useState } from 'react';
import type {
  AutomationQueueItem,
  WorkerHandoff,
  WorkerHandoffSummary,
  CreateAutomationQueueItemRequest,
  CancelRetryResponse,
  QueueStatus,
  ScheduleRetryResponse
} from '@gryyk/contracts';
import {
  createAutomationQueueItem,
  getAutomationQueueItem,
  listAutomationQueueItems
} from '../services/automationQueueClient';
import { cancelWorkerHandoffRetry, prepareWorkerHandoff, scheduleWorkerHandoffRetry } from '../services/workerHandoffClient';

export interface SelectedAutomationQueueItem {
  queueItem: AutomationQueueItem;
  handoff?: WorkerHandoffSummary;
}

interface AutomationQueueState {
  queueItems: AutomationQueueItem[];
  loading: boolean;
  error: string | null;
  selectedQueueItem: SelectedAutomationQueueItem | null;
  statusFilter: QueueStatus | 'all';
}

interface UseAutomationQueueState extends AutomationQueueState {
  createQueueItem: (request: CreateAutomationQueueItemRequest) => Promise<AutomationQueueItem>;
  loadQueueItem: (id: string) => Promise<SelectedAutomationQueueItem>;
  cancelHandoffRetry: (handoffId: string, reason: string) => Promise<CancelRetryResponse>;
  prepareHandoff: (queueItemId: string) => Promise<WorkerHandoff>;
  scheduleHandoffRetry: (handoffId: string, reason: string) => Promise<ScheduleRetryResponse>;
  selectQueueItem: (queueItem: AutomationQueueItem | null) => void;
  setStatusFilter: (status: QueueStatus | 'all') => void;
  queueItemsForDecision: (decisionId: string) => AutomationQueueItem[];
}

export function useAutomationQueue(): UseAutomationQueueState {
  const [state, setState] = useState<AutomationQueueState>({
    queueItems: [],
    loading: true,
    error: null,
    selectedQueueItem: null,
    statusFilter: 'all'
  });

  const statusFilter = state.statusFilter;

  useEffect(() => {
    let active = true;

    listAutomationQueueItems(statusFilter === 'all' ? {} : { status: statusFilter })
      .then(({ queueItems }) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          queueItems,
          selectedQueueItem: current.selectedQueueItem ?? (queueItems[0] ? { queueItem: queueItems[0] } : null),
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
          error: error instanceof Error ? error.message : 'Unable to load automation queue.'
        }));
      });

    return () => {
      active = false;
    };
  }, [statusFilter]);

  async function createQueueItem(request: CreateAutomationQueueItemRequest): Promise<AutomationQueueItem> {
    const { queueItem } = await createAutomationQueueItem(request);

    setState((current) => ({
      ...current,
      queueItems: [queueItem, ...current.queueItems.filter((item) => item.id !== queueItem.id)],
      selectedQueueItem: { queueItem },
      error: null
    }));

    return queueItem;
  }

  async function loadQueueItem(id: string): Promise<SelectedAutomationQueueItem> {
    const { queueItem, handoff } = await getAutomationQueueItem(id);
    const selectedQueueItem = { queueItem, handoff };

    setState((current) => ({
      ...current,
      queueItems: current.queueItems.map((item) => (item.id === queueItem.id ? queueItem : item)),
      selectedQueueItem,
      error: null
    }));

    return selectedQueueItem;
  }

  async function prepareHandoff(queueItemId: string): Promise<WorkerHandoff> {
    const { handoff } = await prepareWorkerHandoff(queueItemId);
    await loadQueueItem(queueItemId);
    return handoff;
  }

  async function scheduleHandoffRetry(handoffId: string, reason: string): Promise<ScheduleRetryResponse> {
    const response = await scheduleWorkerHandoffRetry(handoffId, { reason });
    const selected = state.selectedQueueItem;
    if (selected) {
      await loadQueueItem(selected.queueItem.id);
    }
    return response;
  }

  async function cancelHandoffRetry(handoffId: string, reason: string): Promise<CancelRetryResponse> {
    const response = await cancelWorkerHandoffRetry(handoffId, { reason });
    const selected = state.selectedQueueItem;
    if (selected) {
      await loadQueueItem(selected.queueItem.id);
    }
    return response;
  }

  const queueItemsByDecision = useMemo(() => {
    return state.queueItems.reduce<Record<string, AutomationQueueItem[]>>((index, item) => {
      index[item.sourceDecisionId] = [...(index[item.sourceDecisionId] ?? []), item];
      return index;
    }, {});
  }, [state.queueItems]);

  return {
    ...state,
    createQueueItem,
    loadQueueItem,
    cancelHandoffRetry,
    prepareHandoff,
    scheduleHandoffRetry,
    selectQueueItem: (queueItem) => {
      setState((current) => ({ ...current, selectedQueueItem: queueItem ? { queueItem } : null }));
      if (queueItem) {
        void loadQueueItem(queueItem.id);
      }
    },
    setStatusFilter: (statusFilter) => setState((current) => ({ ...current, statusFilter })),
    queueItemsForDecision: (decisionId) => queueItemsByDecision[decisionId] ?? []
  };
}
