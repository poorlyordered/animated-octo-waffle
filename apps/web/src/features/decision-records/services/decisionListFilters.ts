import type { DecisionRecord, DecisionStatus } from '@gryyk/contracts';

export type DecisionSourceFilter = 'all' | 'opportunity' | 'numbers';
export type DecisionStatusFilter = 'all' | DecisionStatus;

export interface DecisionListFilters {
  source: DecisionSourceFilter;
  status: DecisionStatusFilter;
}

export interface DecisionListSettings extends DecisionListFilters {
  pageSize: DecisionListPageSize;
}

export interface DecisionListCounts {
  approved: number;
  playerImpacting: number;
  proposed: number;
  rejected: number;
  total: number;
  visible: number;
}

export interface DecisionListPage<T> {
  endIndex: number;
  items: T[];
  page: number;
  pageSize: DecisionListPageSize;
  startIndex: number;
  totalItems: number;
  totalPages: number;
}

export const decisionListPageSizes = [3, 5, 10] as const;
export type DecisionListPageSize = (typeof decisionListPageSizes)[number];

export const defaultDecisionListSettings: DecisionListSettings = {
  pageSize: 5,
  source: 'all',
  status: 'all'
};

const decisionStatuses: DecisionStatus[] = ['proposed', 'approved', 'delegated', 'done', 'rejected'];
const decisionSources: DecisionSourceFilter[] = ['all', 'opportunity', 'numbers'];

export function isDecisionStatusFilter(value: unknown): value is DecisionStatusFilter {
  return value === 'all' || decisionStatuses.includes(value as DecisionStatus);
}

export function isDecisionSourceFilter(value: unknown): value is DecisionSourceFilter {
  return decisionSources.includes(value as DecisionSourceFilter);
}

export function isDecisionListPageSize(value: unknown): value is DecisionListPageSize {
  return decisionListPageSizes.includes(value as DecisionListPageSize);
}

export function parseDecisionListSettings(value: unknown): DecisionListSettings {
  if (!value || typeof value !== 'object') {
    return defaultDecisionListSettings;
  }

  const candidate = value as Record<string, unknown>;
  return {
    pageSize: isDecisionListPageSize(candidate.pageSize) ? candidate.pageSize : defaultDecisionListSettings.pageSize,
    source: isDecisionSourceFilter(candidate.source) ? candidate.source : defaultDecisionListSettings.source,
    status: isDecisionStatusFilter(candidate.status) ? candidate.status : defaultDecisionListSettings.status
  };
}

export function readDecisionListSettings(storage: Pick<Storage, 'getItem'>, key: string): DecisionListSettings {
  const stored = storage.getItem(key);
  if (!stored) {
    return defaultDecisionListSettings;
  }

  try {
    return parseDecisionListSettings(JSON.parse(stored));
  } catch {
    return defaultDecisionListSettings;
  }
}

export function writeDecisionListSettings(
  storage: Pick<Storage, 'setItem'>,
  key: string,
  settings: DecisionListSettings
): void {
  storage.setItem(key, JSON.stringify(settings));
}

export function decisionSourceDomain(decision: DecisionRecord): Exclude<DecisionSourceFilter, 'all'> {
  return decision.sourceContext?.sourceType === 'numbers_follow_up' ? 'numbers' : 'opportunity';
}

export function decisionSourceLabel(decision: DecisionRecord): string {
  return decisionSourceDomain(decision) === 'numbers' ? 'Numbers follow-up' : 'Opportunity / brief';
}

export function filterDecisionRecords(decisions: DecisionRecord[], filters: DecisionListFilters): DecisionRecord[] {
  return decisions.filter((decision) => {
    const statusMatches = filters.status === 'all' || decision.status === filters.status;
    const sourceMatches = filters.source === 'all' || decisionSourceDomain(decision) === filters.source;

    return statusMatches && sourceMatches;
  });
}

export function paginateDecisionRecords<T>(
  items: T[],
  requestedPage: number,
  pageSize: DecisionListPageSize
): DecisionListPage<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  return {
    endIndex,
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    startIndex,
    totalItems,
    totalPages
  };
}

export function decisionListCounts(decisions: DecisionRecord[], visible: DecisionRecord[]): DecisionListCounts {
  return {
    approved: decisions.filter((decision) => decision.status === 'approved').length,
    playerImpacting: decisions.filter((decision) => decision.isPlayerImpacting).length,
    proposed: decisions.filter((decision) => decision.status === 'proposed').length,
    rejected: decisions.filter((decision) => decision.status === 'rejected').length,
    total: decisions.length,
    visible: visible.length
  };
}
