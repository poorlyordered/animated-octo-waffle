import { useState } from 'react';
import type {
  IntelligenceRefreshDomain,
  IntelligenceRefreshMode,
  IntelligenceRefreshReadinessResponse,
  IntelligenceRefreshRunDetailResponse,
  IntelligenceRefreshRunSummary,
  IntelligenceRefreshTimelineItem
} from '@gryyk/contracts';
import { deriveRefreshRunViewModel, deriveTimelineItem, newestRefreshRun } from '../services/intelligenceRefreshSurface';

interface IntelligenceRefreshPanelProps {
  error: string | null;
  loading: boolean;
  readiness: IntelligenceRefreshReadinessResponse | null;
  runs: IntelligenceRefreshRunSummary[];
  selectedRun: IntelligenceRefreshRunDetailResponse | null;
  onCreateRun: (domains: IntelligenceRefreshDomain[], mode?: IntelligenceRefreshMode, reason?: string) => Promise<unknown>;
  onLoadRun: (runId: string) => Promise<unknown>;
  onRefresh: () => Promise<unknown>;
  onRetryStep: (runId: string, stepId: string, reason: string) => Promise<unknown>;
  onSkipStep: (runId: string, stepId: string, reason: string) => Promise<unknown>;
}

const fullRefreshDomains: IntelligenceRefreshDomain[] = ['numbers', 'opportunity', 'people'];
const refreshModes: Array<{ value: IntelligenceRefreshMode; label: string }> = [
  { value: 'full_refresh', label: 'Full refresh' },
  { value: 'prepare_sources', label: 'Prepare fresh sources' },
  { value: 'evaluate_existing', label: 'Evaluate existing data' }
];
const domainOptions: Array<{ value: IntelligenceRefreshDomain; label: string }> = [
  { value: 'numbers', label: 'Numbers' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'people', label: 'People' }
];

export function IntelligenceRefreshPanel({
  error,
  loading,
  readiness,
  runs,
  selectedRun,
  onCreateRun,
  onLoadRun,
  onRefresh,
  onRetryStep,
  onSkipStep
}: IntelligenceRefreshPanelProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<IntelligenceRefreshDomain[]>(fullRefreshDomains);
  const [selectedMode, setSelectedMode] = useState<IntelligenceRefreshMode>('full_refresh');
  const latest = newestRefreshRun(runs);
  const latestView = latest ? deriveRefreshRunViewModel(latest) : null;

  async function handleCreate(domains: IntelligenceRefreshDomain[], mode: IntelligenceRefreshMode, label: string) {
    setBusyAction(label);
    try {
      const response = await onCreateRun(domains, mode, `Commander requested ${label} intelligence refresh.`);
      const duplicate = Boolean(response && typeof response === 'object' && 'duplicate' in response && response.duplicate);
      setActionStatus(duplicate ? 'Active matching refresh run is already queued.' : 'Intelligence refresh run created.');
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to create intelligence refresh run.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLoadRun(runId: string) {
    setBusyAction(`load-${runId}`);
    try {
      await onLoadRun(runId);
      setActionStatus('Refresh run detail loaded.');
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to load refresh run detail.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleStepIntent(action: 'retry' | 'skip', item: IntelligenceRefreshTimelineItem) {
    const detail = selectedRun;
    if (!detail) return;

    setBusyAction(`${action}-${item.stepId}`);
    try {
      const reason =
        action === 'retry'
          ? `Commander requested retry intent for ${item.domain} after reviewing the refresh console.`
          : `Commander skipped ${item.domain} after reviewing missing output consequences.`;
      if (action === 'retry') {
        await onRetryStep(detail.run.id, item.stepId, reason);
        setActionStatus('Retry intent recorded. No worker was dispatched and no external service was executed.');
      } else {
        await onSkipStep(detail.run.id, item.stepId, reason);
        setActionStatus('Skip intent recorded. Missing outputs remain visible for review.');
      }
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : `Unable to record ${action} intent.`);
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
          {latestView ? <p>{latestView.statusExplanation.reason}</p> : null}
        </div>
        <span className={`status-pill status-${latestView?.statusExplanation.tone ?? 'empty'}`}>
          {latestView?.statusExplanation.label ?? 'none'}
        </span>
      </header>

      <section className="summary" aria-label="Refresh run controls">
        <h2>Refresh Console</h2>
        {readiness ? (
          <div className="refresh-readiness" aria-label="Refresh readiness checklist">
            <div className={`status-pill status-${readiness.overallStatus}`}>Readiness: {readiness.overallStatus}</div>
            <div className="coverage-grid">
              {readiness.items.map((item) => (
                <article className={`coverage-item coverage-item-${item.status === 'ready' ? 'present' : 'missing'}`} key={item.key}>
                  <span>{item.label}</span>
                  <strong>{item.status}</strong>
                  <p>{item.reason}</p>
                  {item.requiredAction ? <p className="missing-reasons">{item.requiredAction}</p> : null}
                  {item.safeDetails.length > 0 ? <p>{item.safeDetails.join(' ')}</p> : null}
                </article>
              ))}
            </div>
            <p className="notice">{readiness.boundary}</p>
          </div>
        ) : null}

        <fieldset className="refresh-console-controls">
          <legend>Refresh mode</legend>
          <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value as IntelligenceRefreshMode)}>
            {refreshModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="refresh-console-controls">
          <legend>Domains</legend>
          <div className="button-row" role="group" aria-label="Refresh domains">
            {domainOptions.map((domain) => (
              <label className="checkbox-row" key={domain.value}>
                <input
                  checked={selectedDomains.includes(domain.value)}
                  onChange={(event) => {
                    setSelectedDomains((current) =>
                      event.target.checked
                        ? [...new Set([...current, domain.value])]
                        : current.filter((item) => item !== domain.value)
                    );
                  }}
                  type="checkbox"
                />
                {domain.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-actions">
          <button
            type="button"
            onClick={() => void handleCreate(selectedDomains, selectedMode, selectedMode)}
            disabled={Boolean(busyAction) || selectedDomains.length === 0}
          >
            {busyAction === selectedMode ? 'Creating...' : 'Create refresh run'}
          </button>
          <button type="button" className="secondary" onClick={() => void handleCreate(fullRefreshDomains, 'full_refresh', 'full')} disabled={Boolean(busyAction)}>
            {busyAction === 'full' ? 'Creating...' : 'Start full refresh'}
          </button>
          <button type="button" className="secondary" onClick={() => void handleCreate(['numbers'], 'full_refresh', 'numbers')} disabled={Boolean(busyAction)}>
            {busyAction === 'numbers' ? 'Creating...' : 'Start Numbers'}
          </button>
          <button type="button" className="secondary" onClick={() => void handleCreate(['opportunity', 'people'], 'full_refresh', 'operations')} disabled={Boolean(busyAction)}>
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
          <p>
            Board status: <strong>{latestView.statusExplanation.label}</strong>. {latestView.statusExplanation.reason}
          </p>
          {latestView.statusExplanation.nextAction ? <p>{latestView.statusExplanation.nextAction}</p> : null}
          <button type="button" className="secondary" onClick={() => void handleLoadRun(latestView.run.id)} disabled={Boolean(busyAction)}>
            {busyAction === `load-${latestView.run.id}` ? 'Loading...' : 'Inspect latest run'}
          </button>
          <p className="notice">{latestView.run.boundary}</p>
        </section>
      ) : (
        <section className="summary" aria-label="Latest intelligence refresh">
          <h2>Latest run</h2>
          <p>No intelligence refresh runs are available.</p>
        </section>
      )}

      {selectedRun ? (
        <section className="summary" aria-label="Selected refresh run detail">
          <h2>Run detail</h2>
          <p>
            {selectedRun.run.id} · {selectedRun.run.mode.replaceAll('_', ' ')} · {selectedRun.run.status.replaceAll('_', ' ')}
          </p>
          <div className="coverage-grid" aria-label="Refresh timeline">
            {selectedRun.timeline.map((item) => (
              <article className={`coverage-item coverage-item-${item.statusTone === 'complete' ? 'present' : 'missing'}`} key={item.stepId}>
                <span>{item.domain}</span>
                <strong>{item.statusLabel}</strong>
                {item.owner ? <p>Owner: {item.owner}</p> : null}
                {item.nextAction ? <p>{item.nextAction}</p> : null}
                {item.failure ? <p className="missing-reasons">{item.failure}</p> : null}
                {item.blocker ? <p className="missing-reasons">{item.blocker}</p> : null}
                {item.artifactLinks.length > 0 ? (
                  <p>Artifacts: {item.artifactLinks.map((link) => `${link.label} ${link.id}`).join(', ')}</p>
                ) : null}
                <div className="button-row">
                  {item.canRetry ? (
                    <button
                      type="button"
                      className="secondary"
                      disabled={Boolean(busyAction)}
                      onClick={() => void handleStepIntent('retry', item)}
                    >
                      {busyAction === `retry-${item.stepId}` ? 'Recording...' : 'Record retry intent'}
                    </button>
                  ) : null}
                  {item.canSkip ? (
                    <button
                      type="button"
                      className="secondary"
                      disabled={Boolean(busyAction)}
                      onClick={() => void handleStepIntent('skip', item)}
                    >
                      {busyAction === `skip-${item.stepId}` ? 'Recording...' : 'Skip step'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <h2>Event log</h2>
          {selectedRun.events.length > 0 ? (
            <ol className="refresh-run-list">
              {selectedRun.events.map((event) => (
                <li className="refresh-run-item" key={event.id}>
                  <strong>{event.message}</strong>
                  <p>
                    {event.eventType.replaceAll('_', ' ')} by {event.actor} at {new Date(event.createdAt).toLocaleString()}
                  </p>
                  {event.safeDetails.length > 0 ? <p>{event.safeDetails.join(' ')}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p>No run events are available.</p>
          )}
        </section>
      ) : null}

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
                      <span className={`status-pill status-${view.statusExplanation.tone}`}>{view.statusExplanation.label}</span>
                    </header>
                    <p>
                      Requested by {run.requestedBy} at {new Date(run.createdAt).toLocaleString()}
                    </p>
                    <p>Mode: {run.mode.replaceAll('_', ' ')}</p>
                    <p>{view.statusExplanation.reason}</p>
                    <button
                      type="button"
                      className="secondary"
                      disabled={Boolean(busyAction)}
                      onClick={() => void handleLoadRun(run.id)}
                    >
                      {busyAction === `load-${run.id}` ? 'Loading...' : 'Inspect run'}
                    </button>
                    <div className="coverage-grid" aria-label={`${run.id} domain steps`}>
                      {run.steps.map((step) => (
                        <div className={`coverage-item coverage-item-${step.status === 'completed' ? 'present' : 'missing'}`} key={step.id}>
                          {(() => {
                            const timelineItem = deriveTimelineItem(step, run.policy.allowPartialEvaluation);
                            return (
                              <>
                                <span>{step.domain}</span>
                                <strong>{timelineItem.statusLabel}</strong>
                                {timelineItem.nextAction ? <p>{timelineItem.nextAction}</p> : null}
                              </>
                            );
                          })()}
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
