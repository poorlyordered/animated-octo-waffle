import { useState } from 'react';
import type { OperationsHealthResponse } from '@gryyk/contracts';
import {
  defaultOperationsHealthFilters,
  filterOperationsWarnings,
  filterWorkerReadiness,
  operationsHealthFilterCounts,
  type OperationsHealthFilters,
  type OperationsWarningSeverityFilter,
  type OperationsWorkerSecretFilter,
  type OperationsWorkerStatusFilter
} from '../services/operationsHealthFilters';

interface OperationsHealthPanelProps {
  error: string | null;
  health: OperationsHealthResponse | null;
  loading: boolean;
}

function formattedDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : 'Unavailable';
}

function statusClass(status: string): string {
  return status === 'ready' ? 'status-processed' : status === 'blocked' ? 'status-stale failure-state' : 'status-stale';
}

export function OperationsHealthPanel({ error, health, loading }: OperationsHealthPanelProps) {
  const [filters, setFilters] = useState<OperationsHealthFilters>(defaultOperationsHealthFilters);

  if (loading) {
    return <main className="command-brief">Loading operations health...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  if (!health) {
    return null;
  }

  const visibleWarnings = filterOperationsWarnings(health.warnings, filters.warningSeverity);
  const visibleWorkerReadiness = filterWorkerReadiness(health.workerReadiness, filters);
  const counts = operationsHealthFilterCounts(health.warnings, visibleWarnings, health.workerReadiness, visibleWorkerReadiness);

  return (
    <main className="command-brief" aria-label="Operations health">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Operations</p>
          <h1>Operations health</h1>
        </div>
        <span className={`status-pill ${statusClass(health.overallStatus)}`}>{health.overallStatus}</span>
      </header>

      <section className="summary" aria-label="Operations health summary">
        <h2>Health summary</h2>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Corporation</dt>
            <dd>{health.corporationId}</dd>
          </div>
          <div className="metadata-item">
            <dt>Generated</dt>
            <dd>{formattedDate(health.generatedAt)}</dd>
          </div>
          <div className="metadata-item">
            <dt>Warnings</dt>
            <dd>{health.warnings.length}</dd>
          </div>
        </dl>
        <p className="notice">{health.boundary}</p>
      </section>

      <section className="summary" aria-label="Operations health filters">
        <h2>Health filters</h2>
        <div className="form-actions">
          <label htmlFor="operations-warning-filter">
            Warning severity
            <select
              id="operations-warning-filter"
              value={filters.warningSeverity}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  warningSeverity: event.target.value as OperationsWarningSeverityFilter
                }))
              }
            >
              <option value="all">All warnings</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label htmlFor="operations-worker-status-filter">
            Worker status
            <select
              id="operations-worker-status-filter"
              value={filters.workerStatus}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  workerStatus: event.target.value as OperationsWorkerStatusFilter
                }))
              }
            >
              <option value="all">All worker statuses</option>
              <option value="ready">Ready</option>
              <option value="degraded">Degraded</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <label htmlFor="operations-worker-secret-filter">
            Secret state
            <select
              id="operations-worker-secret-filter"
              value={filters.workerSecret}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  workerSecret: event.target.value as OperationsWorkerSecretFilter
                }))
              }
            >
              <option value="all">All secret states</option>
              <option value="configured">Configured</option>
              <option value="fallback">Fallback</option>
              <option value="missing">Missing</option>
            </select>
          </label>
        </div>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Visible warnings</dt>
            <dd>
              {counts.visibleWarnings} of {counts.totalWarnings}
            </dd>
          </div>
          <div className="metadata-item">
            <dt>Visible workers</dt>
            <dd>
              {counts.visibleWorkers} of {counts.totalWorkers}
            </dd>
          </div>
        </dl>
        <p className="notice">Operations health filters organize browser-visible summaries only. They do not store preferences, call providers, dispatch workers, execute retries, fetch ESI, write to EVE, or mutate external services.</p>
      </section>

      <section aria-label="Command API health">
        <h2>Command APIs</h2>
        <div className="coverage-grid">
          {health.commandApis.map((api) => (
            <article className={`coverage-item coverage-item-${api.status === 'ready' ? 'present' : 'missing'}`} key={api.key}>
              <span>{api.label}</span>
              <strong>{api.status}</strong>
              <p>{api.evidence}</p>
              <p>Latest: {formattedDate(api.lastUpdatedAt)}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Ingestion health">
        <h2>Ingestion posture</h2>
        <div className="coverage-grid">
          {health.ingestion.map((ingestion) => (
            <article className={`coverage-item coverage-item-${ingestion.status === 'ready' ? 'present' : 'missing'}`} key={ingestion.key}>
              <span>{ingestion.label}</span>
              <strong>{ingestion.status}</strong>
              <p>{ingestion.evidence}</p>
              <p>Latest: {formattedDate(ingestion.latestAt)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="summary" aria-label="Retry posture">
        <h2>Retry posture</h2>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Scheduled</dt>
            <dd>{health.retryPosture.scheduled}</dd>
          </div>
          <div className="metadata-item">
            <dt>Blocked</dt>
            <dd>{health.retryPosture.blocked}</dd>
          </div>
          <div className="metadata-item">
            <dt>Worker handoff targets</dt>
            <dd>{health.retryPosture.workerHandoffTargets}</dd>
          </div>
          <div className="metadata-item">
            <dt>ESI sync targets</dt>
            <dd>{health.retryPosture.esiSyncTargets}</dd>
          </div>
        </dl>
        <p>{health.retryPosture.evidence}</p>
      </section>

      <section aria-label="Worker readiness">
        <h2>Worker readiness</h2>
        {visibleWorkerReadiness.length > 0 ? (
          <div className="coverage-grid">
            {visibleWorkerReadiness.map((worker) => (
              <article className={`coverage-item coverage-item-${worker.status === 'ready' ? 'present' : 'missing'}`} key={worker.workerClass}>
                <span>{worker.label}</span>
                <strong>{worker.status}</strong>
                <p>Secret state: {worker.secretState}</p>
                <p>{worker.evidence}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>No worker readiness records match the selected filters.</p>
        )}
      </section>

      <section className="summary" aria-label="Operations warnings">
        <h2>Warnings</h2>
        {visibleWarnings.length > 0 ? (
          <ul>
            {visibleWarnings.map((warning) => (
              <li key={warning.key}>
                <strong>{warning.severity}</strong>: {warning.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No operations warnings match the selected filters.</p>
        )}
      </section>
    </main>
  );
}
