import type { CommandBriefViewModel } from '@gryyk/contracts';
import { OperatingLegCoverage } from './OperatingLegCoverage';

interface CommandBriefPanelProps {
  loading?: boolean;
  error?: string | null;
  viewModel: CommandBriefViewModel;
}

function Metadata({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function CommandBriefPanel({ loading = false, error = null, viewModel }: CommandBriefPanelProps) {
  const { brief, request, displayState, staleReason } = viewModel;

  if (loading) {
    return <main className="command-brief">Loading command brief...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  if (displayState === 'empty') {
    return <main className="command-brief empty-state">No command brief has been processed yet.</main>;
  }

  if (displayState === 'failed' && !brief) {
    return (
      <main className="command-brief failure-state">
        <h1>Research failed</h1>
        <p>{request?.errorMessage ?? 'The latest research pull failed.'}</p>
      </main>
    );
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Command Brief</p>
          <h1>Corporation state</h1>
        </div>
        <div className={`status-pill status-${displayState}`}>{displayState}</div>
      </header>

      {displayState === 'processing' ? (
        <section className="notice">Research is processing. Status: {request?.status}</section>
      ) : null}

      {displayState === 'stale' ? (
        <section className="notice">Showing older processed brief. {staleReason}</section>
      ) : null}

      {brief ? (
        <>
          <section className="summary">
            <h2>Executive summary</h2>
            <p>{brief.executiveSummary || 'No executive summary was provided.'}</p>
          </section>

          <section className="metadata-grid" aria-label="Brief metadata">
            <Metadata label="Created" value={new Date(brief.createdAt).toLocaleString()} />
            <Metadata label="Model" value={brief.model} />
            <Metadata label="Prompt" value={brief.promptVersion} />
            <Metadata label="Sources" value={brief.sourceCount} />
            <Metadata label="Confidence" value={`${Math.round(brief.confidence * 100)}%`} />
          </section>

          <OperatingLegCoverage coverage={brief.coverage} />

          <ListSection title="Strategic impacts" items={brief.strategicImpacts} />
          <ListSection title="Recommended actions" items={brief.recommendedActions} />
          <ListSection title="Watchlist" items={brief.watchlist} />
          <ListSection title="Memory" items={brief.memory} />

          {brief.sourceReferences.length > 0 ? (
            <section>
              <h2>Source references</h2>
              <ul>
                {brief.sourceReferences.map((source) => (
                  <li key={`${source.title}-${source.url ?? source.sourceId ?? ''}`}>
                    {source.url ? <a href={source.url}>{source.title}</a> : source.title}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
