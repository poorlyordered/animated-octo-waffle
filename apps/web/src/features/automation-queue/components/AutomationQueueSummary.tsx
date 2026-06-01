import type { AutomationQueueItem } from '@gryyk/contracts';

interface AutomationQueueSummaryProps {
  queueItem: AutomationQueueItem;
}

export function AutomationQueueSummary({ queueItem }: AutomationQueueSummaryProps) {
  return (
    <section className="summary" aria-label="Queued work summary">
      <h3>Queued work</h3>
      <p>{queueItem.taskIntent}</p>
      <dl className="metadata-grid">
        <div className="metadata-item">
          <dt>Status</dt>
          <dd>{queueItem.status}</dd>
        </div>
        <div className="metadata-item">
          <dt>Source decision</dt>
          <dd>{queueItem.sourceDecisionId}</dd>
        </div>
        <div className="metadata-item">
          <dt>Attempts</dt>
          <dd>{queueItem.attempts}</dd>
        </div>
      </dl>
      <p className="notice">Queued work is not execution. No worker, EVE action, retry, or external service has run.</p>
    </section>
  );
}
