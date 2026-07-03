import { useState } from 'react';
import type { IntelligenceRefreshDomain, IntelligenceRefreshRunSummary } from '@gryyk/contracts';
import { deriveRefreshRunViewModel, newestRefreshRun } from '../services/intelligenceRefreshSurface';

interface IntelligenceRefreshPanelProps {
  error: string | null;
  loading: boolean;
  runs: IntelligenceRefreshRunSummary[];
  onCreateRun: (domains: IntelligenceRefreshDomain[], reason?: string) => Promise<unknown>;
  onRefresh: () => Promise<unknown>;
}

const fullRefreshDomains: IntelligenceRefreshDomain[] = ['numbers', 'opportunity', 'people'];

export function IntelligenceRefreshPanel({ error, loading, runs, onCreateRun, onRefresh }: IntelligenceRefreshPanelProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const latest = newestRefreshRun(runs);
  const latestView = latest ? deriveRefreshRunViewModel(latest) : null;

  async function handleCreate(domains: IntelligenceRefreshDomain[], label: string) {
    setBusyAction(label);
    try {
      const response = await onCreateRun(domains, `Commander requested ${label} intelligence refresh.`);
      const duplicate = Boolean(response && typeof response === 'object' && 'duplicate' in response && response.duplicate);
      setActionStatus(duplicate ? 'Active matching refresh run is already queued.' : 'Intelligence refresh run created.');
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to create intelligence refresh run.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRefresh() {
    setBusyAction('reload');
    try {
      await onRefresh();
      setActionStatus('Refresh run list updated.');
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to reload intelligence refresh runs.');
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) {
    return <main className="command-brief">Loading intelligence refresh runs...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  return (
    <main className="command-brief intelligence-refresh" aria-label="Intelligence refresh runs">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Intelligence</p>
          <h1>Refresh runs</h1>
        </div>
        <span className={`status-pill status-${latest?.status ?? 'empty'}`}>{latestView?.statusLabel ?? 'none'}</span>
      </header>

      <section className="summary" aria-label="Refresh run controls">
        <h2>Run controls</h2>
        <div className="form-actions">
          <button type="button" onClick={() => void handleCreate(fullRefreshDomains, 'full')} disabled={Boolean(busyAction)}>
            {busyAction === 'full' ? 'Creating...' : 'Start full refresh'}
          </button>
          <button type="button" onClick={() => void handleCreate(['numbers'], 'numbers')} disabled={Boolean(busyAction)}>
            {busyAction === 'numbers' ? 'Creating...' : 'Start Numbers'}
          </button>
          <button type="button" onClick={() => void handleCreate(['opportunity', 'people'], 'operations')} disabled={Boolean(busyAction)}>
            {busyAction === 'operations' ? 'Creating...' : 'Start Ops'}
          </button>
          <button type="button" className="secondary" onClick={() => void handleRefresh()} disabled={Boolean(busyAction)}>
            {busyAction === 'reload' ? 'Refreshing...' : 'Reload'}
          </button>
        </div>
        {actionStatus ? <p className="notice">{actionStatus}</p> : null}
      </section>

      {latestView ? (
        <section className="summary" aria-label="Latest intelligence refresh">
          <h2>Latest run</h2>
          <dl className="metadata-grid">
            <div className="metadata-item">
              <dt>Domains</dt>
              <dd>{latestView.domainLabel}</dd>
            </div>
            <div className="metadata-item">
              <dt>Steps</dt>
              <dd>
                {latestView.completedCount}/{latestView.run.steps.length}
              </dd>
            </div>
            <div className="metadata-item">
              <dt>Sources</dt>
              <dd>{latestView.sourceCount}</dd>
            </div>
            <div className="metadata-item">
              <dt>Evaluation</dt>
              <dd>{latestView.evaluationLabel}</dd>
            </div>
            <div className="metadata-item">
              <dt>Warnings</dt>
              <dd>{latestView.warningCount}</dd>
            </div>
            <div className="metadata-item">
              <dt>Updated</dt>
              <dd>{new Date(latestView.run.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {latestView.run.evaluation.brainRunId ? <p>Brain run: {latestView.run.evaluation.brainRunId}</p> : null}
          {latestView.run.evaluation.commandBriefId ? <p>Command brief: {latestView.run.evaluation.commandBriefId}</p> : null}
          <p className="notice">{latestView.run.boundary}</p>
        </section>
      ) : (
        <section className="summary" aria-label="Latest intelligence refresh">
          <h2>Latest run</h2>
          <p>No intelligence refresh runs are available.</p>
        </section>
      )}

      <section aria-label="Recent intelligence refresh runs">
        <h2>Recent runs</h2>
        {runs.length > 0 ? (
          <ul className="refresh-run-list">
            {runs.map((run) => {
              const view = deriveRefreshRunViewModel(run);
              return (
                <li key={run.id}>
                  <article className="refresh-run-item">
                    <header>
                      <strong>{view.title}</strong>
                      <span className={`status-pill status-${run.status}`}>{view.statusLabel}</span>
                    </header>
                    <p>
                      Requested by {run.requestedBy} at {new Date(run.createdAt).toLocaleString()}
                    </p>
                    <div className="coverage-grid" aria-label={`${run.id} domain steps`}>
                      {run.steps.map((step) => (
                        <div className={`coverage-item coverage-item-${step.status === 'completed' ? 'present' : 'missing'}`} key={step.id}>
                          <span>{step.domain}</span>
                          <strong>{step.status}</strong>
                          {step.preparedRequest ? <p>{step.preparedRequest.type}: {step.preparedRequest.id}</p> : null}
                          {step.claimedBy ? <p>Worker: {step.claimedBy}</p> : null}
                          {step.sourceCount !== undefined ? <p>Sources: {step.sourceCount}</p> : null}
                          {step.sectionStatuses.length > 0 ? (
                            <p>Sections: {step.sectionStatuses.map((section) => `${section.key} ${section.status}`).join(', ')}</p>
                          ) : null}
                          {step.failure ? <p className="missing-reasons">Failed: {step.failure.reason}</p> : null}
                          {step.warnings.length > 0 ? <p className="missing-reasons">Warnings: {step.warnings.join(', ')}</p> : null}
                        </div>
                      ))}
                    </div>
                    {run.evaluation.sourceSummary.length > 0 ? (
                      <p>Evaluation sources: {run.evaluation.sourceSummary.join(' | ')}</p>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No recent refresh runs.</p>
        )}
      </section>
    </main>
  );
}
