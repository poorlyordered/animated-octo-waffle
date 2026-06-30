import { useState } from 'react';
import type { PeopleIngestionProvenance, PeopleIngestionSectionStatus } from '@gryyk/contracts';

interface PeopleIngestionProvenancePanelProps {
  provenance: PeopleIngestionProvenance | null;
  onPrepareIngestion: () => Promise<{ message: string }>;
}

function statusLabel(status: PeopleIngestionSectionStatus): string {
  return `${status.key}: ${status.status}`;
}

function modeLabel(mode: PeopleIngestionProvenance['mode']): string {
  if (mode === 'latest_ingestion') {
    return 'latest ingestion';
  }

  if (mode === 'historical_profiles') {
    return 'historical profiles';
  }

  return 'unavailable';
}

export function PeopleIngestionProvenancePanel({ onPrepareIngestion, provenance }: PeopleIngestionProvenancePanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  if (!provenance) {
    return null;
  }

  async function prepare() {
    setPreparing(true);
    try {
      const response = await onPrepareIngestion();
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to prepare People ingestion.');
    } finally {
      setPreparing(false);
    }
  }

  return (
    <section aria-label="People ingestion provenance">
      <div className="section-heading">
        <h2>Ingestion provenance</h2>
        <button type="button" onClick={() => void prepare()} disabled={preparing}>
          {preparing ? 'Preparing...' : 'Prepare ingestion'}
        </button>
      </div>
      <div className="metadata-grid">
        <div className="metadata-item">
          <span>Mode</span>
          <strong>{modeLabel(provenance.mode)}</strong>
        </div>
        <div className="metadata-item">
          <span>Profiles</span>
          <strong>{provenance.profileCount}</strong>
        </div>
        <div className="metadata-item">
          <span>Sources</span>
          <strong>{provenance.sourceCount}</strong>
        </div>
      </div>
      <div className="notice">
        <p className="eyebrow">{modeLabel(provenance.mode)}</p>
        <h3>{provenance.message}</h3>
        <p>{provenance.boundary}</p>
        {message ? <p>{message}</p> : null}
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
                <span>{item.completedAt ?? item.claimedAt ?? item.requestedAt}</span>
                {item.failure ? <small>{item.failure.reason}</small> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No People ingestion history is available.</p>
        )}
      </div>
    </section>
  );
}
