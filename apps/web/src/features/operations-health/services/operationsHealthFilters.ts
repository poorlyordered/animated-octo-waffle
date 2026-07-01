import type { OperationsHealthWarning, OperationsHealthWarningSeverity, WorkerReadinessSummary } from '@gryyk/contracts';

export type OperationsWarningSeverityFilter = 'all' | OperationsHealthWarningSeverity;
export type OperationsWorkerStatusFilter = 'all' | WorkerReadinessSummary['status'];
export type OperationsWorkerSecretFilter = 'all' | WorkerReadinessSummary['secretState'];

export interface OperationsHealthFilters {
  warningSeverity: OperationsWarningSeverityFilter;
  workerSecret: OperationsWorkerSecretFilter;
  workerStatus: OperationsWorkerStatusFilter;
}

export interface OperationsHealthSavedView {
  filters: OperationsHealthFilters;
  id: string;
  label: string;
}

export interface OperationsHealthFilterCounts {
  totalWarnings: number;
  totalWorkers: number;
  visibleWarnings: number;
  visibleWorkers: number;
}

export const defaultOperationsHealthFilters: OperationsHealthFilters = {
  warningSeverity: 'all',
  workerSecret: 'all',
  workerStatus: 'all'
};

const warningSeverityFilters: OperationsWarningSeverityFilter[] = ['all', 'info', 'warning', 'critical'];
const workerStatusFilters: OperationsWorkerStatusFilter[] = ['all', 'ready', 'degraded', 'blocked'];
const workerSecretFilters: OperationsWorkerSecretFilter[] = ['all', 'configured', 'fallback', 'missing'];

function isWarningSeverityFilter(value: unknown): value is OperationsWarningSeverityFilter {
  return warningSeverityFilters.includes(value as OperationsWarningSeverityFilter);
}

function isWorkerStatusFilter(value: unknown): value is OperationsWorkerStatusFilter {
  return workerStatusFilters.includes(value as OperationsWorkerStatusFilter);
}

function isWorkerSecretFilter(value: unknown): value is OperationsWorkerSecretFilter {
  return workerSecretFilters.includes(value as OperationsWorkerSecretFilter);
}

export function parseOperationsHealthFilters(value: unknown): OperationsHealthFilters {
  if (!value || typeof value !== 'object') {
    return defaultOperationsHealthFilters;
  }

  const candidate = value as Record<string, unknown>;
  return {
    warningSeverity: isWarningSeverityFilter(candidate.warningSeverity)
      ? candidate.warningSeverity
      : defaultOperationsHealthFilters.warningSeverity,
    workerSecret: isWorkerSecretFilter(candidate.workerSecret) ? candidate.workerSecret : defaultOperationsHealthFilters.workerSecret,
    workerStatus: isWorkerStatusFilter(candidate.workerStatus) ? candidate.workerStatus : defaultOperationsHealthFilters.workerStatus
  };
}

function savedViewId(filters: OperationsHealthFilters): string {
  return `${filters.warningSeverity}:${filters.workerStatus}:${filters.workerSecret}`;
}

export function operationsHealthSavedViewLabel(filters: OperationsHealthFilters): string {
  const warnings = filters.warningSeverity === 'all' ? 'all warnings' : filters.warningSeverity;
  const workers = filters.workerStatus === 'all' ? 'all workers' : filters.workerStatus;
  const secrets = filters.workerSecret === 'all' ? 'all secrets' : filters.workerSecret;
  return `Warnings: ${warnings} / Workers: ${workers} / Secrets: ${secrets}`;
}

export function operationsHealthSavedViewFromFilters(filters: OperationsHealthFilters): OperationsHealthSavedView {
  return {
    filters: { ...filters },
    id: savedViewId(filters),
    label: operationsHealthSavedViewLabel(filters)
  };
}

export function parseOperationsHealthSavedViews(value: unknown): OperationsHealthSavedView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const views = value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    if (!candidate.filters || typeof candidate.filters !== 'object') {
      return [];
    }

    const filterCandidate = candidate.filters as Record<string, unknown>;
    if (
      !isWarningSeverityFilter(filterCandidate.warningSeverity) ||
      !isWorkerStatusFilter(filterCandidate.workerStatus) ||
      !isWorkerSecretFilter(filterCandidate.workerSecret)
    ) {
      return [];
    }

    const filters = parseOperationsHealthFilters(filterCandidate);
    const view = operationsHealthSavedViewFromFilters(filters);
    const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
    return [{ ...view, label: label || view.label }];
  });

  return Array.from(new Map(views.map((view) => [view.id, view])).values());
}

export function readOperationsHealthSavedViews(storage: Pick<Storage, 'getItem'>, key: string): OperationsHealthSavedView[] {
  const stored = storage.getItem(key);
  if (!stored) {
    return [];
  }

  try {
    return parseOperationsHealthSavedViews(JSON.parse(stored));
  } catch {
    return [];
  }
}

export function writeOperationsHealthSavedViews(
  storage: Pick<Storage, 'setItem'>,
  key: string,
  views: OperationsHealthSavedView[]
): void {
  storage.setItem(key, JSON.stringify(views));
}

export function saveOperationsHealthView(
  views: OperationsHealthSavedView[],
  filters: OperationsHealthFilters
): OperationsHealthSavedView[] {
  const view = operationsHealthSavedViewFromFilters(filters);
  return [view, ...views.filter((item) => item.id !== view.id)];
}

export function filterOperationsWarnings(
  warnings: OperationsHealthWarning[],
  severity: OperationsWarningSeverityFilter
): OperationsHealthWarning[] {
  if (severity === 'all') {
    return warnings;
  }

  return warnings.filter((warning) => warning.severity === severity);
}

export function filterWorkerReadiness(
  workers: WorkerReadinessSummary[],
  filters: Pick<OperationsHealthFilters, 'workerSecret' | 'workerStatus'>
): WorkerReadinessSummary[] {
  return workers.filter((worker) => {
    const statusMatches = filters.workerStatus === 'all' || worker.status === filters.workerStatus;
    const secretMatches = filters.workerSecret === 'all' || worker.secretState === filters.workerSecret;

    return statusMatches && secretMatches;
  });
}

export function operationsHealthFilterCounts(
  warnings: OperationsHealthWarning[],
  visibleWarnings: OperationsHealthWarning[],
  workers: WorkerReadinessSummary[],
  visibleWorkers: WorkerReadinessSummary[]
): OperationsHealthFilterCounts {
  return {
    totalWarnings: warnings.length,
    totalWorkers: workers.length,
    visibleWarnings: visibleWarnings.length,
    visibleWorkers: visibleWorkers.length
  };
}
