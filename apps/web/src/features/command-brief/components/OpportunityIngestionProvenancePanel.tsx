import type { OpportunityIngestionProvenance, OpportunityIngestionSectionStatus } from '@gryyk/contracts';

interface OpportunityIngestionProvenancePanelProps {
  provenance?: OpportunityIngestionProvenance | null;
}

function statusLabel(status: OpportunityIngestionSectionStatus): string {
  return `${status.key}: ${status.status}`;
}

function modeLabel(mode: OpportunityIngestionProvenance['mode']): string {
  if (mode === 'latest_research') {
    return 'latest research';
  }

  if (mode === 'historical_brief') {
    return 'historical brief';
  }

  return 'unavailable';
}

export function OpportunityIngestionProvenancePanel({ provenance }: OpportunityIngestionProvenancePanelProps) {
  if (!provenance) {
    return null;
  }

  return (
    <section aria-label="Opportunity ingestion provenance">
      <h2>Opportunity provenance</h2>
      <div className="metadata-grid">
        <div className="metadata-item">
          <span>Mode</span>
          <strong>{modeLabel(provenance.mode)}</strong>
        </div>
        <div className="metadata-item">
          <span>Briefs</span>
          <strong>{provenance.briefCount}</strong>
        </div>
        <div className="metadata-item">
          <span>Sources</span>
          <strong>{provenance.sourceCount}</strong>
        </div>
      </div>
      <div className="notice">
        <p className="eyebrow">{provenance.focus}</p>
        <h3>{provenance.message}</h3>
        <p>{provenance.boundary}</p>
        <div className="coverage-grid">
          {provenance.sectionStatuses.map((status) => (
            <span className="status-pill" key={status.key}>
              {statusLabel(status)}
            </span>
          ))}
        </div>
        {provenance.history.length > 0 ? (
          <ul>
            {provenance.history.map((item) => (
              <li key={item.id}>
                <strong>{item.status}</strong>
                <span>{item.updatedAt}</span>
                {item.failure ? <small>{item.failure.reason}</small> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No Opportunity research history is available.</p>
        )}
      </div>
    </section>
  );
}
