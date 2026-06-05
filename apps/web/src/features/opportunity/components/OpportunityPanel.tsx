import { useState } from 'react';
import type {
  AutomationQueueItem,
  CommandBrief,
  CreateAutomationQueueItemRequest,
  CreateDecisionRecordRequest,
  DecisionRecord,
  UpdateDecisionStatusRequest,
  WorkerHandoffSummary
} from '@gryyk/contracts';
import type { OpportunityIngestionProvenance, SourceReference } from '@gryyk/contracts';
import { DecisionRecordCreate } from '../../decision-records/components/DecisionRecordCreate';
import {
  deriveOpportunityDecisionHandoff,
  deriveOpportunityQueuedWorkHandoff,
  type OpportunityDecisionHandoff,
  type OpportunityQueuedWorkHandoff,
  type OpportunitySurfaceViewModel
} from '../services/opportunitySurface';

interface OpportunityPanelProps {
  loading: boolean;
  error: string | null;
  opportunity: OpportunitySurfaceViewModel;
  sourceBrief?: CommandBrief | null;
  onCreateQueue?: (request: CreateAutomationQueueItemRequest) => Promise<AutomationQueueItem>;
  onCreateDecision?: (request: CreateDecisionRecordRequest) => DecisionRecord | Promise<DecisionRecord | void> | void;
  onPrepareWorkerHandoff?: (queueItemId: string) => Promise<WorkerHandoffSummary>;
  onUpdateDecisionStatus?: (decisionId: string, request: UpdateDecisionStatusRequest) => Promise<DecisionRecord>;
}

interface OpportunityQueuedWorkDetail {
  queueItem: AutomationQueueItem;
  handoff?: WorkerHandoffSummary;
}

function Metadata({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TextList({
  emptyText,
  items,
  onSelect
}: {
  emptyText: string;
  items: string[];
  onSelect?: (item: string) => void;
}) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <span>{item}</span>
          {onSelect ? (
            <button type="button" onClick={() => onSelect(item)}>
              Record decision
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function OpportunityDecisionHandoffSummary({ handoff }: { handoff: OpportunityDecisionHandoff }) {
  return (
    <section className="decision-summary" aria-label="Opportunity decision handoff">
      <h2>Opportunity decision handoff</h2>
      <p>{handoff.message}</p>
      <dl className="metadata-grid">
        <Metadata label="Decision" value={handoff.decisionId} />
        <Metadata label="Status" value={handoff.decisionStatus} />
        <Metadata label="Approval" value={handoff.approvalRequired ? 'required' : 'resolved'} />
        <Metadata label="Queue" value={handoff.queueItemId ? `${handoff.queueItemId} ${handoff.queueStatus ?? ''}` : handoff.queueReady ? 'ready' : 'blocked'} />
        <Metadata label="Source brief" value={handoff.sourceBriefId} />
        <Metadata label="Sources" value={handoff.sourceCount} />
        <Metadata label="Focus" value={handoff.focus} />
        <Metadata label="Provenance" value={handoff.provenanceMode.replace('_', ' ')} />
      </dl>
      <p className="notice">{handoff.boundary}</p>
    </section>
  );
}

function OpportunityQueuedWorkDetailSummary({
  detail,
  handoff,
  onPrepare,
  preparing
}: {
  detail: OpportunityQueuedWorkDetail;
  handoff: OpportunityQueuedWorkHandoff;
  onPrepare?: () => void;
  preparing: boolean;
}) {
  return (
    <section className="decision-summary" aria-label="Opportunity queued work detail">
      <h2>Opportunity queued work detail</h2>
      <p>{handoff.message}</p>
      <dl className="metadata-grid">
        <Metadata label="Queue item" value={handoff.queueItemId} />
        <Metadata label="Queue status" value={handoff.queueStatus} />
        <Metadata label="Task intent" value={handoff.taskIntent} />
        <Metadata label="Expected output" value={handoff.expectedOutput} />
        <Metadata label="Attempts" value={handoff.attempts} />
        <Metadata label="Worker handoff" value={handoff.handoffId ? `${handoff.handoffId} ${handoff.handoffStatus ?? ''}` : 'not prepared'} />
        {handoff.handoffCreatedAt ? <Metadata label="Handoff created" value={new Date(handoff.handoffCreatedAt).toLocaleString()} /> : null}
      </dl>
      <p className="notice">{handoff.boundary}</p>
      {!detail.handoff && onPrepare ? (
        <button type="button" onClick={onPrepare} disabled={preparing}>
          {preparing ? 'Preparing...' : 'Prepare worker handoff'}
        </button>
      ) : null}
    </section>
  );
}

function SourceList({ sources }: { sources: SourceReference[] }) {
  if (sources.length === 0) {
    return <p className="empty-state">No Opportunity source references are available.</p>;
  }

  return (
    <ul>
      {sources.map((source) => (
        <li key={`${source.title}-${source.url ?? source.sourceId ?? ''}`}>
          {source.url ? <a href={source.url}>{source.title}</a> : source.title}
          {source.sourceId ? <small> {source.sourceId}</small> : null}
        </li>
      ))}
    </ul>
  );
}

function OpportunityProvenanceSummary({ provenance }: { provenance: OpportunityIngestionProvenance | null }) {
  if (!provenance) {
    return <p className="empty-state">No Opportunity provenance is available for this corporation scope.</p>;
  }

  return (
    <>
      <p>{provenance.message}</p>
      <dl className="metadata-grid">
        <Metadata label="Mode" value={provenance.mode.replace('_', ' ')} />
        <Metadata label="Focus" value={provenance.focus} />
        <Metadata label="Sources" value={provenance.sourceCount} />
        <Metadata label="Briefs" value={provenance.briefCount} />
      </dl>
      <div className="coverage-grid" aria-label="Opportunity section status">
        {provenance.sectionStatuses.map((section) => (
          <article className={`coverage-item coverage-item-${section.status}`} key={section.key}>
            <span>{section.key}</span>
            <strong>{section.status}</strong>
          </article>
        ))}
      </div>
      <h3>Recent research history</h3>
      {provenance.history.length === 0 ? (
        <p className="empty-state">No Opportunity research history is available.</p>
      ) : (
        <ul>
          {provenance.history.map((item) => (
            <li key={item.id}>
              <strong>{item.status}</strong> {new Date(item.updatedAt).toLocaleString()}
              {item.sourceCount !== undefined ? <span> Sources: {item.sourceCount}.</span> : null}
              {item.failure ? <span> Failure: {item.failure.reason}.</span> : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function OpportunityPanel({
  error,
  loading,
  onCreateDecision,
  onCreateQueue,
  onPrepareWorkerHandoff,
  onUpdateDecisionStatus,
  opportunity,
  sourceBrief
}: OpportunityPanelProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [createdDecision, setCreatedDecision] = useState<DecisionRecord | null>(null);
  const [createdHandoff, setCreatedHandoff] = useState<OpportunityDecisionHandoff | null>(null);
  const [queuedWorkDetail, setQueuedWorkDetail] = useState<OpportunityQueuedWorkDetail | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function handleDecisionStatus(status: Extract<UpdateDecisionStatusRequest['status'], 'approved' | 'rejected'>) {
    if (!createdDecision || !onUpdateDecisionStatus) {
      return;
    }

    setBusyAction(status);
    try {
      const decision = await onUpdateDecisionStatus(createdDecision.id, {
        status,
        approvalText:
          status === 'approved'
            ? `Commander approves this Opportunity recommendation for queued planning: ${createdDecision.sourceRecommendation}.`
            : undefined,
        note:
          status === 'rejected'
            ? `Commander rejected this Opportunity recommendation: ${createdDecision.sourceRecommendation}.`
            : 'Commander approved this Opportunity recommendation for queued planning.'
      });
      setCreatedDecision(decision);
      const handoff = deriveOpportunityDecisionHandoff(decision, opportunity);
      setCreatedHandoff(handoff);
      setQueuedWorkDetail(null);
      setActionStatus(
        status === 'approved'
          ? `Decision approved. Queue creation remains a separate commander action. ${handoff.message}`
          : `Decision rejected. No queued work was created. ${handoff.message}`
      );
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to update Opportunity decision status.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleCreateQueue() {
    if (!createdDecision || !onCreateQueue) {
      return;
    }

    setBusyAction('queue');
    try {
      const queueItem = await onCreateQueue({
        sourceDecisionId: createdDecision.id,
        taskIntent: `Opportunity planning: ${createdDecision.sourceRecommendation}`,
        inputSummary: `Use Opportunity recommendation from brief ${createdDecision.sourceBriefId}: ${createdDecision.sourceRecommendation}`,
        expectedOutput: `Prepare commander review options for Opportunity recommendation: ${createdDecision.sourceRecommendation}.`
      });
      const handoff = deriveOpportunityDecisionHandoff(createdDecision, opportunity, queueItem);
      setCreatedHandoff(handoff);
      setQueuedWorkDetail({ queueItem });
      setActionStatus(`Queued work created. ${handoff.message}`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to create Opportunity queued work.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePrepareWorkerHandoff() {
    if (!queuedWorkDetail || !onPrepareWorkerHandoff) {
      return;
    }

    setBusyAction('worker-handoff');
    try {
      const handoff = await onPrepareWorkerHandoff(queuedWorkDetail.queueItem.id);
      const detail = { ...queuedWorkDetail, handoff };
      const handoffSummary = deriveOpportunityQueuedWorkHandoff(detail.queueItem, handoff);
      setQueuedWorkDetail(detail);
      setActionStatus(`Worker handoff prepared. ${handoffSummary.message}`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to prepare Opportunity worker handoff.');
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) {
    return <main className="command-brief">Loading opportunity...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 Opportunity</p>
          <h1>Opportunity operating layer</h1>
        </div>
        <div className={`status-pill status-${opportunity.displayState}`}>{opportunity.displayState}</div>
      </header>

      <section className="summary" aria-label="Opportunity summary">
        <h2>Opportunity summary</h2>
        <p>{opportunity.summary}</p>
      </section>

      <section className="metadata-grid" aria-label="Opportunity metadata">
        <Metadata label="Coverage" value={opportunity.coverageState} />
        <Metadata label="Sources" value={opportunity.sourceCount} />
        <Metadata label="Confidence" value={opportunity.confidence === null ? 'Unavailable' : `${Math.round(opportunity.confidence * 100)}%`} />
        <Metadata label="Model" value={opportunity.model ?? 'Unavailable'} />
        <Metadata label="Prompt" value={opportunity.promptVersion ?? 'Unavailable'} />
        <Metadata label="Created" value={opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleString() : 'Unavailable'} />
      </section>

      {opportunity.missingReasons.length > 0 ? (
        <section className="notice" aria-label="Opportunity missing context">
          {opportunity.missingReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </section>
      ) : null}

      <section aria-label="Opportunity strategic impacts">
        <h2>Strategic impacts</h2>
        <TextList items={opportunity.strategicImpacts} emptyText="No Opportunity strategic impacts are available." />
      </section>

      <section aria-label="Opportunity recommendations">
        <h2>Recommended actions</h2>
        <TextList
          items={opportunity.recommendedActions}
          emptyText="No Opportunity recommendations are available."
          onSelect={sourceBrief && onCreateDecision ? setSelectedRecommendation : undefined}
        />
      </section>

      {sourceBrief && selectedRecommendation && onCreateDecision ? (
        <DecisionRecordCreate
          brief={sourceBrief}
          recommendation={selectedRecommendation}
          onCancel={() => setSelectedRecommendation(null)}
          onCreate={async (request) => {
            const decision = await onCreateDecision(request);
            if (decision) {
              setCreatedDecision(decision);
              setCreatedHandoff(deriveOpportunityDecisionHandoff(decision, opportunity));
              setActionStatus('Decision recorded. Approval and queue creation remain separate commander actions.');
            }
            setSelectedRecommendation(null);
            return decision;
          }}
        />
      ) : null}

      {createdHandoff ? <OpportunityDecisionHandoffSummary handoff={createdHandoff} /> : null}
      {queuedWorkDetail ? (
        <OpportunityQueuedWorkDetailSummary
          detail={queuedWorkDetail}
          handoff={deriveOpportunityQueuedWorkHandoff(queuedWorkDetail.queueItem, queuedWorkDetail.handoff)}
          onPrepare={onPrepareWorkerHandoff ? () => void handlePrepareWorkerHandoff() : undefined}
          preparing={busyAction === 'worker-handoff'}
        />
      ) : null}
      {createdDecision && createdDecision.status === 'proposed' && onUpdateDecisionStatus ? (
        <section className="form-actions" aria-label="Opportunity decision approval controls">
          <button type="button" onClick={() => void handleDecisionStatus('approved')} disabled={busyAction === 'approved'}>
            {busyAction === 'approved' ? 'Approving...' : 'Approve decision'}
          </button>
          <button type="button" className="secondary" onClick={() => void handleDecisionStatus('rejected')} disabled={busyAction === 'rejected'}>
            {busyAction === 'rejected' ? 'Rejecting...' : 'Reject decision'}
          </button>
        </section>
      ) : null}
      {createdDecision && createdDecision.status === 'approved' && onCreateQueue && !createdHandoff?.queueItemId ? (
        <section className="form-actions" aria-label="Opportunity queue controls">
          <button type="button" onClick={() => void handleCreateQueue()} disabled={busyAction === 'queue'}>
            {busyAction === 'queue' ? 'Queueing...' : 'Create queued work'}
          </button>
        </section>
      ) : null}
      {actionStatus ? <p className="notice">{actionStatus}</p> : null}

      <section aria-label="Opportunity watchlist">
        <h2>Watchlist</h2>
        <TextList items={opportunity.watchlist} emptyText="No Opportunity watchlist items are available." />
      </section>

      <section aria-label="Opportunity sources">
        <h2>Source references</h2>
        <SourceList sources={opportunity.sourceReferences} />
      </section>

      <section aria-label="Opportunity provenance">
        <h2>Opportunity provenance</h2>
        <OpportunityProvenanceSummary provenance={opportunity.provenance} />
      </section>

      <p className="notice">{opportunity.boundary}</p>
    </main>
  );
}
