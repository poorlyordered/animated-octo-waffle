import {
  filterOperationsWarnings,
  filterWorkerReadiness,
  operationsHealthFilterCounts,
  operationsHealthSavedViewFromFilters,
  parseOperationsHealthFilters,
  parseOperationsHealthSavedViews,
  readOperationsHealthSavedViews,
  saveOperationsHealthView,
  writeOperationsHealthSavedViews
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

  it('parses operations health filters safely', () => {
    expect(parseOperationsHealthFilters({ warningSeverity: 'warning', workerStatus: 'blocked', workerSecret: 'missing' })).toEqual({
      warningSeverity: 'warning',
      workerStatus: 'blocked',
      workerSecret: 'missing'
    });
    expect(parseOperationsHealthFilters({ warningSeverity: 'unsafe', workerStatus: 'bad', workerSecret: 'unknown' })).toEqual({
      warningSeverity: 'all',
      workerStatus: 'all',
      workerSecret: 'all'
    });
  });

  it('saves and parses browser-local operations health views safely', () => {
    const filters = { warningSeverity: 'warning' as const, workerStatus: 'blocked' as const, workerSecret: 'missing' as const };
    const view = operationsHealthSavedViewFromFilters(filters);

    expect(view).toEqual({
      id: 'warning:blocked:missing',
      label: 'Warnings: warning / Workers: blocked / Secrets: missing',
      filters
    });
    expect(saveOperationsHealthView([view], filters)).toHaveLength(1);
    expect(
      parseOperationsHealthSavedViews([
        { filters, label: 'Blocked opportunity ingestion' },
        { filters },
        { filters: { warningSeverity: 'unsafe', workerStatus: 'bad', workerSecret: 'unknown' } }
      ])
    ).toEqual([view]);
  });

  it('reads and writes browser-local operations health saved views', () => {
    const storage = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value)
    };
    const views = [
      operationsHealthSavedViewFromFilters({
        warningSeverity: 'info',
        workerStatus: 'ready',
        workerSecret: 'configured'
      })
    ];

    writeOperationsHealthSavedViews(adapter, 'operations-health-views', views);
    expect(readOperationsHealthSavedViews(adapter, 'operations-health-views')).toEqual(views);
    storage.set('operations-health-views', '{bad json');
    expect(readOperationsHealthSavedViews(adapter, 'operations-health-views')).toEqual([]);
  });
});
