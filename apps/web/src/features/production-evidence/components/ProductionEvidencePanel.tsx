import { useState } from 'react';
import type {
  CreateProductionEvidenceRequest,
  ProductionEvidenceCheck,
  ProductionEvidenceCheckKey,
  ProductionEvidenceCheckStatus,
  ProductionEvidenceDecision,
  ProductionEvidenceEnvironment,
  ProductionEvidenceListResponse
} from '@gryyk/contracts';
import { productionEvidenceCheckKeys } from '@gryyk/contracts';
import {
  defaultProductionEvidenceFilters,
  filterProductionEvidenceRecords,
  productionEvidenceFilterCounts,
  type ProductionEvidenceCheckStatusFilter,
  type ProductionEvidenceDecisionFilter,
  type ProductionEvidenceEnvironmentFilter,
  type ProductionEvidenceFilters
} from '../services/productionEvidenceFilters';

interface ProductionEvidencePanelProps {
  error: string | null;
  evidence: ProductionEvidenceListResponse | null;
  loading: boolean;
  onCreate: (request: CreateProductionEvidenceRequest) => Promise<void>;
  saving: boolean;
}

const defaultChecks: ProductionEvidenceCheck[] = productionEvidenceCheckKeys.map((key) => ({
  key,
  status: 'verified',
  evidence: 'Verified without storing values.'
}));

const checkLabels: Record<ProductionEvidenceCheckKey, string> = {
  validation: 'Validation',
  netlify_environment: 'Netlify environment',
  eve_sso_provider: 'EVE SSO provider',
  mongodb: 'MongoDB',
  monitoring: 'Monitoring',
  worker_secrets: 'Worker secrets',
  smoke_test: 'Smoke test',
  rollback: 'Rollback'
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function statusClass(decision: ProductionEvidenceDecision): string {
  return decision === 'go' ? 'status-processed' : decision === 'no_go' ? 'status-stale failure-state' : 'status-stale';
}

export function ProductionEvidencePanel({ error, evidence, loading, onCreate, saving }: ProductionEvidencePanelProps) {
  const [environment, setEnvironment] = useState<ProductionEvidenceEnvironment>('production');
  const [decision, setDecision] = useState<ProductionEvidenceDecision>('controlled_staging');
  const [filters, setFilters] = useState<ProductionEvidenceFilters>(defaultProductionEvidenceFilters);
  const [commitSha, setCommitSha] = useState('');
  const [pullRequestUrl, setPullRequestUrl] = useState('');
  const [deployId, setDeployId] = useState('');
  const [rollbackTarget, setRollbackTarget] = useState('');
  const [checks, setChecks] = useState<ProductionEvidenceCheck[]>(defaultChecks);

  function updateCheck(index: number, patch: Partial<ProductionEvidenceCheck>) {
    setChecks((current) => current.map((check, checkIndex) => (checkIndex === index ? { ...check, ...patch } : check)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate({
      environment,
      decision,
      commitSha,
      pullRequestUrl: pullRequestUrl || null,
      deployId: deployId || null,
      rollbackTarget: rollbackTarget || null,
      checks
    });
  }

  if (loading) {
    return <main className="command-brief">Loading production evidence...</main>;
  }

  const visibleRecords = evidence ? filterProductionEvidenceRecords(evidence.records, filters) : [];
  const counts = evidence ? productionEvidenceFilterCounts(evidence.records, visibleRecords) : { totalRecords: 0, visibleRecords: 0 };

  return (
    <main className="command-brief" aria-label="Production evidence">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Operations</p>
          <h1>Production evidence</h1>
        </div>
        <span className="status-pill">value-free</span>
      </header>

      {error ? <p className="form-error">{error}</p> : null}
      {evidence ? <p className="notice">{evidence.boundary}</p> : null}

      <section className="summary" aria-label="Production evidence filters">
        <h2>Evidence filters</h2>
        <div className="form-actions">
          <label htmlFor="production-evidence-environment-filter">
            Environment
            <select
              id="production-evidence-environment-filter"
              value={filters.environment}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  environment: event.target.value as ProductionEvidenceEnvironmentFilter
                }))
              }
            >
              <option value="all">All environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="controlled_staging">Controlled staging</option>
            </select>
          </label>
          <label htmlFor="production-evidence-decision-filter">
            Decision
            <select
              id="production-evidence-decision-filter"
              value={filters.decision}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  decision: event.target.value as ProductionEvidenceDecisionFilter
                }))
              }
            >
              <option value="all">All decisions</option>
              <option value="go">Go</option>
              <option value="no_go">No go</option>
              <option value="controlled_staging">Controlled staging</option>
            </select>
          </label>
          <label htmlFor="production-evidence-check-filter">
            Check status
            <select
              id="production-evidence-check-filter"
              value={filters.checkStatus}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  checkStatus: event.target.value as ProductionEvidenceCheckStatusFilter
                }))
              }
            >
              <option value="all">All check statuses</option>
              <option value="verified">Verified</option>
              <option value="attention">Attention</option>
              <option value="blocked">Blocked</option>
              <option value="not_applicable">Not applicable</option>
            </select>
          </label>
        </div>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Visible records</dt>
            <dd>
              {counts.visibleRecords} of {counts.totalRecords}
            </dd>
          </div>
        </dl>
        <p className="notice">Production evidence filters organize browser-visible records only. They do not store preferences, call providers, export production data, deploy, rollback, dispatch workers, fetch ESI, write to EVE, or mutate external services.</p>
      </section>

      <section className="summary" aria-label="Record production evidence">
        <h2>Record evidence</h2>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Environment
            <select value={environment} onChange={(event) => setEnvironment(event.target.value as ProductionEvidenceEnvironment)}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="controlled_staging">Controlled staging</option>
            </select>
          </label>
          <label>
            Decision
            <select value={decision} onChange={(event) => setDecision(event.target.value as ProductionEvidenceDecision)}>
              <option value="go">Go</option>
              <option value="no_go">No go</option>
              <option value="controlled_staging">Controlled staging</option>
            </select>
          </label>
          <label>
            Commit SHA
            <input value={commitSha} onChange={(event) => setCommitSha(event.target.value)} placeholder="abcdef1" />
          </label>
          <label>
            Pull request URL
            <input value={pullRequestUrl} onChange={(event) => setPullRequestUrl(event.target.value)} placeholder="https://github.com/..." />
          </label>
          <label>
            Deploy ID
            <input value={deployId} onChange={(event) => setDeployId(event.target.value)} placeholder="netlify-deploy-id" />
          </label>
          <label>
            Rollback target
            <input value={rollbackTarget} onChange={(event) => setRollbackTarget(event.target.value)} placeholder="previous deploy id or commit" />
          </label>
          <div className="coverage-grid" aria-label="Evidence checks">
            {checks.map((check, index) => (
              <fieldset className="metadata-item" key={check.key}>
                <legend>{checkLabels[check.key]}</legend>
                <label>
                  Status
                  <select
                    value={check.status}
                    onChange={(event) => updateCheck(index, { status: event.target.value as ProductionEvidenceCheckStatus })}
                  >
                    <option value="verified">Verified</option>
                    <option value="attention">Attention</option>
                    <option value="blocked">Blocked</option>
                    <option value="not_applicable">Not applicable</option>
                  </select>
                </label>
                <label>
                  Evidence
                  <input value={check.evidence} onChange={(event) => updateCheck(index, { evidence: event.target.value })} />
                </label>
              </fieldset>
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Recording...' : 'Record evidence'}
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Recent production evidence">
        <h2>Recent evidence</h2>
        {evidence && visibleRecords.length > 0 ? (
          <div className="coverage-grid">
            {visibleRecords.map((record) => (
              <article className="coverage-item" key={record.id}>
                <span>{record.environment}</span>
                <strong className={statusClass(record.decision)}>{record.decision}</strong>
                <p>Commit: {record.commitSha}</p>
                <p>Recorded: {formatDate(record.recordedAt)}</p>
                <p>Operator: {record.recordedBy}</p>
                <p>Deploy: {record.deployId ?? 'Not recorded'}</p>
                <p>Rollback: {record.rollbackTarget ?? 'Not recorded'}</p>
                <ul>
                  {record.checks.map((check) => (
                    <li key={check.key}>
                      <strong>{checkLabels[check.key]}</strong>: {check.status}. {check.evidence}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <p>{evidence && evidence.records.length > 0 ? 'No production evidence records match the selected filters.' : 'No production evidence recorded.'}</p>
        )}
      </section>
    </main>
  );
}
