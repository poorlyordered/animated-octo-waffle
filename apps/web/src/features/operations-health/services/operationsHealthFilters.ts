import type { OperationsHealthWarning, OperationsHealthWarningSeverity, WorkerReadinessSummary } from '@gryyk/contracts';

export type OperationsWarningSeverityFilter = 'all' | OperationsHealthWarningSeverity;
export type OperationsWorkerStatusFilter = 'all' | WorkerReadinessSummary['status'];
export type OperationsWorkerSecretFilter = 'all' | WorkerReadinessSummary['secretState'];

export interface OperationsHealthFilters {
  warningSeverity: OperationsWarningSeverityFilter;
  workerSecret: OperationsWorkerSecretFilter;
  workerStatus: OperationsWorkerStatusFilter;
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
