import { useState } from 'react';
import type {
  CreateNumbersFollowUpDecisionRequest,
  CreateNumbersFollowUpQueueRequest,
  NumbersFollowUpDecisionResponse,
  NumbersFollowUpQueueResponse,
  NumbersApprovalHandoff,
  NumbersLiveProvenance,
  NumbersSnapshot,
  UpdateNumbersFollowUpDecisionStatusRequest
} from '@gryyk/contracts';

interface NumbersPanelProps {
  error: string | null;
  liveProvenance: NumbersLiveProvenance | null;
  loading: boolean;
  snapshot: NumbersSnapshot | null;
  onCreateDecision?: (
    candidateId: string,
    request: CreateNumbersFollowUpDecisionRequest
  ) => Promise<NumbersFollowUpDecisionResponse>;
  onUpdateDecisionStatus?: (
    candidateId: string,
    request: UpdateNumbersFollowUpDecisionStatusRequest
  ) => Promise<NumbersFollowUpDecisionResponse>;
  onCreateQueue?: (candidateId: string, request: CreateNumbersFollowUpQueueRequest) => Promise<NumbersFollowUpQueueResponse>;
}

export function NumbersPanel({
  error,
  liveProvenance,
  loading,
  snapshot,
  onCreateDecision,
  onUpdateDecisionStatus,
  onCreateQueue
}: NumbersPanelProps) {
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [handoffByCandidate, setHandoffByCandidate] = useState<Record<string, NumbersApprovalHandoff>>({});
  const [decisionByCandidate, setDecisionByCandidate] = useState<Record<string, NumbersFollowUpDecisionResponse['decision']>>({});
  const [busyCandidateId, setBusyCandidateId] = useState<string | null>(null);

  async function handleCreateDecision(candidateId: string) {
    if (!snapshot || !onCreateDecision) {
      return;
    }

    setBusyCandidateId(candidateId);
    try {
      const response = await onCreateDecision(candidateId, {
        snapshotId: snapshot.id
      });
      setDecisionByCandidate((current) => ({ ...current, [candidateId]: response.decision }));
      setHandoffByCandidate((current) => ({ ...current, [candidateId]: response.approvalHandoff }));
      setActionStatus((current) => ({
        ...current,
        [candidateId]: `${response.message} ${response.approvalHandoff.message}`
      }));
    } catch (actionError) {
      setActionStatus((current) => ({
        ...current,
        [candidateId]: actionError instanceof Error ? actionError.message : 'Unable to record decision.'
      }));
    } finally {
      setBusyCandidateId(null);
    }
  }

  async function handleCreateQueue(candidateId: string) {
    if (!snapshot || !onCreateQueue) {
      return;
    }

    const candidate = snapshot.followUps.find((item) => item.id === candidateId);
    const decision = decisionByCandidate[candidateId];
    if (!candidate || !decision) {
      return;
    }

    setBusyCandidateId(candidateId);
    try {
      const response = await onCreateQueue(candidateId, {
        snapshotId: snapshot.id,
        sourceDecisionId: decision.id,
        taskIntent: candidate.title,
        inputSummary: candidate.rationale,
        expectedOutput: `Prepare commander review options for Numbers follow-up: ${candidate.title}.`
      });
      setHandoffByCandidate((current) => ({ ...current, [candidateId]: response.approvalHandoff }));
      setActionStatus((current) => ({
        ...current,
        [candidateId]: `${response.message} ${response.approvalHandoff.message}`
      }));
    } catch (actionError) {
      setActionStatus((current) => ({
        ...current,
        [candidateId]: actionError instanceof Error ? actionError.message : 'Unable to create queued work.'
      }));
    } finally {
      setBusyCandidateId(null);
    }
  }

  async function handleDecisionStatus(candidateId: string, status: UpdateNumbersFollowUpDecisionStatusRequest['status']) {
    if (!snapshot || !onUpdateDecisionStatus) {
      return;
    }

    const candidate = snapshot.followUps.find((item) => item.id === candidateId);
    const decision = decisionByCandidate[candidateId];
    if (!candidate || !decision) {
      return;
    }

    setBusyCandidateId(candidateId);
    try {
      const response = await onUpdateDecisionStatus(candidateId, {
        snapshotId: snapshot.id,
        sourceDecisionId: decision.id,
        status,
        approvalText:
          status === 'approved'
            ? `Commander approves this Numbers follow-up for queued planning: ${candidate.title}.`
            : undefined,
        note:
          status === 'rejected'
            ? `Commander rejected this Numbers follow-up: ${candidate.title}.`
            : 'Commander approved this Numbers follow-up for queued planning.'
      });
      setDecisionByCandidate((current) => ({ ...current, [candidateId]: response.decision }));
      setHandoffByCandidate((current) => ({ ...current, [candidateId]: response.approvalHandoff }));
      setActionStatus((current) => ({
        ...current,
        [candidateId]: `${response.message} ${response.approvalHandoff.message}`
      }));
    } catch (actionError) {
      setActionStatus((current) => ({
        ...current,
        [candidateId]: actionError instanceof Error ? actionError.message : 'Unable to update decision approval status.'
      }));
    } finally {
      setBusyCandidateId(null);
    }
  }

  if (loading) {
    return <main className="command-brief">Loading numbers...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  if (!snapshot) {
    return (
      <main className="command-brief">
        <header className="brief-header">
          <div>
            <p className="eyebrow">Gryyk-47 Numbers</p>
            <h1>Numbers operating layer</h1>
          </div>
        </header>
        <p className="notice">No processed numbers snapshot is available for this corporation scope.</p>
      </main>
    );
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Numbers</p>
          <h1>Numbers operating layer</h1>
        </div>
      </header>

      <section className="summary" aria-label="Numbers provenance">
        <h2>Snapshot provenance</h2>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Created</dt>
            <dd>{new Date(snapshot.createdAt).toLocaleString()}</dd>
          </div>
          <div className="metadata-item">
            <dt>Sources</dt>
            <dd>{snapshot.provenance.sourceCount}</dd>
          </div>
          <div className="metadata-item">
            <dt>Confidence</dt>
            <dd>{snapshot.provenance.confidence === undefined ? 'Unavailable' : `${Math.round(snapshot.provenance.confidence * 100)}%`}</dd>
          </div>
          <div className="metadata-item">
            <dt>Model</dt>
            <dd>{snapshot.provenance.model ?? 'Unavailable'}</dd>
          </div>
          <div className="metadata-item">
            <dt>Prompt</dt>
            <dd>{snapshot.provenance.promptVersion ?? 'Unavailable'}</dd>
          </div>
        </dl>
        {liveProvenance ? (
          <div className="notice">
            <p>{liveProvenance.message}</p>
            <p>{liveProvenance.boundary}</p>
            <dl className="metadata-grid">
              <div className="metadata-item">
                <dt>Sync mode</dt>
                <dd>{liveProvenance.mode}</dd>
              </div>
              <div className="metadata-item">
                <dt>Sync request</dt>
                <dd>{liveProvenance.syncRequestId ?? 'Unavailable'}</dd>
              </div>
              <div className="metadata-item">
                <dt>Completed</dt>
                <dd>{liveProvenance.completedAt ? new Date(liveProvenance.completedAt).toLocaleString() : 'Unavailable'}</dd>
              </div>
              <div className="metadata-item">
                <dt>Live sources</dt>
                <dd>{liveProvenance.sourceCount}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      <section aria-label="Numbers sections">
        <h2>Operating health</h2>
        <div className="coverage-grid">
          {snapshot.sections.map((section) => (
            <article className={`coverage-item coverage-item-${section.status}`} key={section.key}>
              <span>{section.label}</span>
              <strong>{section.status}</strong>
              <p>{section.summary}</p>
              {section.staleReason ? <p className="missing-reasons">{section.staleReason}</p> : null}
              {section.missingReason ? <p className="missing-reasons">{section.missingReason}</p> : null}
              {section.metrics.length > 0 ? (
                <dl>
                  {section.metrics.map((metric) => (
                    <div key={`${section.key}-${metric.label}`}>
                      <dt>{metric.label}</dt>
                      <dd>
                        {metric.value}
                        {metric.unit ? ` ${metric.unit}` : ''}
                        {metric.trend ? ` (${metric.trend})` : ''}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Numbers observations">
        <h2>Observations</h2>
        <List items={snapshot.observations} emptyText="No numbers observations are available." />
      </section>

      <section aria-label="Numbers risks">
        <h2>Risks</h2>
        <List items={snapshot.risks} emptyText="No numbers risks are available." />
      </section>

      <section aria-label="Numbers opportunities">
        <h2>Opportunities</h2>
        <List items={snapshot.opportunities} emptyText="No numbers opportunities are available." />
      </section>

      <section aria-label="Numbers follow-ups">
        <h2>Follow-up candidates</h2>
        {snapshot.followUps.length === 0 ? (
          <p>No numbers follow-up candidates are available.</p>
        ) : (
          <ul>
            {snapshot.followUps.map((followUp) => (
              <li key={followUp.id}>
                <strong>{followUp.title}</strong>
                <p>{followUp.rationale}</p>
                <p>
                  Suggested path: {followUp.suggestedPath}.{' '}
                  {followUp.isPlayerImpacting ? 'Player-impacting: explicit approval is required later.' : 'Planning only.'}
                </p>
                {handoffByCandidate[followUp.id] ? (
                  <ApprovalHandoffSummary handoff={handoffByCandidate[followUp.id]} />
                ) : null}
                {onCreateDecision ? (
                  <button type="button" onClick={() => void handleCreateDecision(followUp.id)} disabled={busyCandidateId === followUp.id}>
                    {busyCandidateId === followUp.id ? 'Recording...' : 'Record decision'}
                  </button>
                ) : null}
                {onUpdateDecisionStatus && decisionByCandidate[followUp.id]?.status === 'proposed' ? (
                  <div className="button-row" aria-label={`Decision approval controls for ${followUp.title}`}>
                    <button type="button" onClick={() => void handleDecisionStatus(followUp.id, 'approved')} disabled={busyCandidateId === followUp.id}>
                      {busyCandidateId === followUp.id ? 'Approving...' : 'Approve decision'}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => void handleDecisionStatus(followUp.id, 'rejected')}
                      disabled={busyCandidateId === followUp.id}
                    >
                      {busyCandidateId === followUp.id ? 'Rejecting...' : 'Reject decision'}
                    </button>
                  </div>
                ) : null}
                {followUp.suggestedPath === 'queue' &&
                onCreateQueue &&
                decisionByCandidate[followUp.id]?.status === 'approved' ? (
                  <button type="button" onClick={() => void handleCreateQueue(followUp.id)} disabled={busyCandidateId === followUp.id}>
                    {busyCandidateId === followUp.id ? 'Queueing...' : 'Create queued work'}
                  </button>
                ) : null}
                {actionStatus[followUp.id] ? <p className="notice">{actionStatus[followUp.id]}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="notice">Numbers findings are read-only recommendations. This surface does not move ISK, assets, contracts, workers, or EVE state.</p>
      </section>
    </main>
  );
}

function ApprovalHandoffSummary({ handoff }: { handoff: NumbersApprovalHandoff }) {
  return (
    <dl className="metadata-grid" aria-label="Numbers approval handoff">
      <div className="metadata-item">
        <dt>Decision</dt>
        <dd>{handoff.decisionId ?? 'Not recorded'}</dd>
      </div>
      <div className="metadata-item">
        <dt>Approval</dt>
        <dd>{handoff.approvalRequired ? 'required' : 'ready'}</dd>
      </div>
      <div className="metadata-item">
        <dt>Queue</dt>
        <dd>{handoff.queueItemId ? `${handoff.queueItemId} ${handoff.queueStatus ?? ''}` : handoff.queueReady ? 'ready' : 'blocked'}</dd>
      </div>
      <div className="metadata-item">
        <dt>Duplicate</dt>
        <dd>{handoff.duplicate ? 'yes' : 'no'}</dd>
      </div>
      <div className="metadata-item">
        <dt>Boundary</dt>
        <dd>{handoff.boundary}</dd>
      </div>
    </dl>
  );
}

function List({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
