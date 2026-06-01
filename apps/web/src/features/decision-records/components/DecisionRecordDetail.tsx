import { useState, type FormEvent } from 'react';
import type {
  AutomationQueueItem,
  CreateAutomationQueueItemRequest,
  DecisionRecord,
  DecisionStatus,
  UpdateDecisionStatusRequest
} from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';
import { AutomationQueueCreate } from '../../automation-queue/components/AutomationQueueCreate';

interface DecisionRecordDetailProps {
  decision: DecisionRecord | null;
  onUpdateStatus: (decisionId: string, request: UpdateDecisionStatusRequest) => Promise<DecisionRecord> | void;
  queueItems?: AutomationQueueItem[];
  onCreateQueueItem?: (request: CreateAutomationQueueItemRequest) => Promise<AutomationQueueItem> | void;
}

const nextStatuses: DecisionStatus[] = ['approved', 'delegated', 'done', 'rejected'];

export function DecisionRecordDetail({
  decision,
  onUpdateStatus,
  queueItems = [],
  onCreateQueueItem
}: DecisionRecordDetailProps) {
  const [status, setStatus] = useState<DecisionStatus>('approved');
  const [note, setNote] = useState('');
  const [approvalText, setApprovalText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!decision) {
    return <section className="empty-state">Select a decision record.</section>;
  }

  const activeDecision = decision;

  async function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onUpdateStatus(activeDecision.id, {
        status,
        note: note || undefined,
        approvalText: approvalText || undefined
      });
      setNote('');
      setApprovalText('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update decision status.');
    }
  }

  return (
    <section className="decision-detail" aria-label="Decision detail">
      <h2>Decision detail</h2>
      <p>{activeDecision.sourceRecommendation}</p>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{activeDecision.status}</dd>
        </div>
        <div>
          <dt>Rationale</dt>
          <dd>{activeDecision.rationale}</dd>
        </div>
        <div>
          <dt>Expected result</dt>
          <dd>{activeDecision.expectedResult}</dd>
        </div>
      </dl>

      {activeDecision.isPlayerImpacting ? (
        <p className="notice">Player-impacting: explicit approval is required before action-like progression.</p>
      ) : null}
      <p className="notice">Decision records do not execute actions. Approved decisions can create queued work without dispatching workers.</p>

      {queueItems.length > 0 ? (
        <section aria-label="Linked queued work">
          <h3>Linked queued work</h3>
          <ul>
            {queueItems.map((queueItem) => (
              <li key={queueItem.id}>
                {queueItem.taskIntent} - {queueItem.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <OperatingLegCoverage coverage={activeDecision.sourceProvenance.coverage} />

      {onCreateQueueItem ? <AutomationQueueCreate decision={activeDecision} onCreate={onCreateQueueItem} /> : null}

      <form onSubmit={submitStatus}>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as DecisionStatus)}>
            {nextStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Note
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <label>
          Approval text
          <input value={approvalText} onChange={(event) => setApprovalText(event.target.value)} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">Update status</button>
      </form>

      <h3>Status history</h3>
      <ol>
        {activeDecision.statusHistory.map((entry) => (
          <li key={`${entry.toStatus}-${entry.changedAt}`}>
            {entry.fromStatus ? `${entry.fromStatus} to ` : ''}
            {entry.toStatus} at {new Date(entry.changedAt).toLocaleString()}
          </li>
        ))}
      </ol>
    </section>
  );
}
