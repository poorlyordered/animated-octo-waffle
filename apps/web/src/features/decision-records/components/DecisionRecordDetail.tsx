import { useState, type FormEvent } from 'react';
import type { DecisionRecord, DecisionStatus, UpdateDecisionStatusRequest } from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';

interface DecisionRecordDetailProps {
  decision: DecisionRecord | null;
  onUpdateStatus: (decisionId: string, request: UpdateDecisionStatusRequest) => Promise<DecisionRecord> | void;
}

const nextStatuses: DecisionStatus[] = ['approved', 'delegated', 'done', 'rejected'];

export function DecisionRecordDetail({ decision, onUpdateStatus }: DecisionRecordDetailProps) {
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
      <p className="notice">Decision records do not execute actions or create automation queue entries.</p>

      <OperatingLegCoverage coverage={activeDecision.sourceProvenance.coverage} />

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
