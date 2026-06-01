import type { AutomationQueueItem } from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';

interface AutomationQueueDetailProps {
  queueItem: AutomationQueueItem | null;
}

export function AutomationQueueDetail({ queueItem }: AutomationQueueDetailProps) {
  if (!queueItem) {
    return <section className="empty-state">Select queued work.</section>;
  }

  return (
    <section className="decision-detail" aria-label="Automation queue detail">
      <h2>Queue detail</h2>
      <p>{queueItem.taskIntent}</p>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{queueItem.status}</dd>
        </div>
        <div>
          <dt>Source decision</dt>
          <dd>{queueItem.sourceDecisionId}</dd>
        </div>
        <div>
          <dt>Input summary</dt>
          <dd>{queueItem.inputSummary}</dd>
        </div>
        <div>
          <dt>Expected output</dt>
          <dd>{queueItem.expectedOutput}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{queueItem.attempts}</dd>
        </div>
      </dl>

      <p className="notice">Queued work is not execution. This view does not retry, dispatch, or perform EVE actions.</p>

      {queueItem.provenance.coverage ? <OperatingLegCoverage coverage={queueItem.provenance.coverage} /> : null}

      {queueItem.failure ? (
        <section className="failure-state" aria-label="Queue failure">
          <h3>Failure</h3>
          <p>{queueItem.failure.message}</p>
          <p>{new Date(queueItem.failure.failedAt).toLocaleString()}</p>
        </section>
      ) : null}

      {queueItem.retry ? (
        <section aria-label="Retry metadata">
          <h3>Retry</h3>
          <p>{queueItem.retry.eligible ? 'Eligible for future retry.' : 'Not eligible for retry.'}</p>
          {queueItem.retry.notBefore ? <p>Not before {new Date(queueItem.retry.notBefore).toLocaleString()}</p> : null}
        </section>
      ) : null}

      {queueItem.output ? (
        <section aria-label="Queue output">
          <h3>Output</h3>
          <p>{queueItem.output.summary}</p>
          {queueItem.output.completedAt ? <p>{new Date(queueItem.output.completedAt).toLocaleString()}</p> : null}
        </section>
      ) : null}
    </section>
  );
}
