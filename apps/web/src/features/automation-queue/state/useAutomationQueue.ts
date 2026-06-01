import { useEffect, useMemo, useState } from 'react';
import type {
  AutomationQueueItem,
  CreateAutomationQueueItemRequest,
  QueueStatus
} from '@gryyk/contracts';
import {
  createAutomationQueueItem,
  getAutomationQueueItem,
  listAutomationQueueItems
} from '../services/automationQueueClient';

interface AutomationQueueState {
  queueItems: AutomationQueueItem[];
  loading: boolean;
  error: string | null;
  selectedQueueItem: AutomationQueueItem | null;
  statusFilter: QueueStatus | 'all';
}

interface UseAutomationQueueState extends AutomationQueueState {
  createQueueItem: (request: CreateAutomationQueueItemRequest) => Promise<AutomationQueueItem>;
  loadQueueItem: (id: string) => Promise<AutomationQueueItem>;
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
          selectedQueueItem: current.selectedQueueItem ?? queueItems[0] ?? null,
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
      selectedQueueItem: queueItem,
      error: null
    }));

    return queueItem;
  }

  async function loadQueueItem(id: string): Promise<AutomationQueueItem> {
    const { queueItem } = await getAutomationQueueItem(id);

    setState((current) => ({
      ...current,
      queueItems: current.queueItems.map((item) => (item.id === queueItem.id ? queueItem : item)),
      selectedQueueItem: queueItem,
      error: null
    }));

    return queueItem;
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
    selectQueueItem: (queueItem) => setState((current) => ({ ...current, selectedQueueItem: queueItem })),
    setStatusFilter: (statusFilter) => setState((current) => ({ ...current, statusFilter })),
    queueItemsForDecision: (decisionId) => queueItemsByDecision[decisionId] ?? []
  };
}
