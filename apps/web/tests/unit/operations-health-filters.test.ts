import {
  filterOperationsWarnings,
  filterWorkerReadiness,
  operationsHealthFilterCounts
} from '../../src/features/operations-health/services/operationsHealthFilters';
import { operationsHealthResponse } from '../fixtures/operationsHealth';

describe('operations health filters', () => {
  it('filters warnings by severity without mutating the source list', () => {
    const warnings = operationsHealthResponse.warnings;

    expect(filterOperationsWarnings(warnings, 'all')).toEqual(warnings);
    expect(filterOperationsWarnings(warnings, 'warning').map((warning) => warning.key)).toEqual([
      'missing_opportunity_ingestion_secret'
    ]);
    expect(filterOperationsWarnings(warnings, 'critical')).toEqual([]);
    expect(warnings).toHaveLength(2);
  });

  it('filters worker readiness by status and secret state', () => {
    const workers = operationsHealthResponse.workerReadiness;

    expect(filterWorkerReadiness(workers, { workerStatus: 'blocked', workerSecret: 'all' }).map((worker) => worker.workerClass)).toEqual([
      'opportunity_ingestion'
    ]);
    expect(filterWorkerReadiness(workers, { workerStatus: 'all', workerSecret: 'fallback' }).map((worker) => worker.workerClass)).toEqual([
      'retry_worker'
    ]);
    expect(filterWorkerReadiness(workers, { workerStatus: 'ready', workerSecret: 'missing' })).toEqual([]);
  });

  it('counts visible warnings and workers against total browser-visible summaries', () => {
    const visibleWarnings = filterOperationsWarnings(operationsHealthResponse.warnings, 'warning');
    const visibleWorkers = filterWorkerReadiness(operationsHealthResponse.workerReadiness, {
      workerStatus: 'blocked',
      workerSecret: 'missing'
    });

    expect(
      operationsHealthFilterCounts(
        operationsHealthResponse.warnings,
        visibleWarnings,
        operationsHealthResponse.workerReadiness,
        visibleWorkers
      )
    ).toEqual({
      totalWarnings: 2,
      totalWorkers: 5,
      visibleWarnings: 1,
      visibleWorkers: 1
    });
  });
});
