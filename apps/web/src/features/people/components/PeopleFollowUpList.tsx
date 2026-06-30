import { useState } from 'react';
import type {
  CreatePeopleFollowUpQueueRequest,
  FollowUpStatus,
  LeadershipFollowUp,
  PeopleFollowUpHandoff,
  WorkerHandoff,
  UpdatePeopleFollowUpDecisionStatusRequest
} from '@gryyk/contracts';

interface PeopleFollowUpListProps {
  followUps: LeadershipFollowUp[];
  handoffByFollowUpId: Record<string, PeopleFollowUpHandoff>;
  statusFilter: FollowUpStatus | 'all';
  onCreateQueue: (followUpId: string, request: CreatePeopleFollowUpQueueRequest) => Promise<unknown>;
  onPrepareWorkerHandoff?: (queueItemId: string) => Promise<WorkerHandoff>;
  onRecordDecision: (followUpId: string, request: { rationale?: string; expectedResult?: string }) => Promise<unknown>;
  onStatusFilterChange: (status: FollowUpStatus | 'all') => void;
  onUpdateDecisionStatus: (followUpId: string, request: UpdatePeopleFollowUpDecisionStatusRequest) => Promise<unknown>;
}

const statuses: Array<FollowUpStatus | 'all'> = ['all', 'open', 'blocked', 'completed', 'canceled'];

interface PeopleQueuedWorkDetail {
  queueItemId: string;
  queueStatus?: string;
  handoffId?: string;
  handoffStatus?: WorkerHandoff['status'];
  handoffCreatedAt?: string;
  message: string;
  boundary: string;
}

const peopleWorkerHandoffBoundary =
  'People worker handoff preparation creates a durable record only. It does not dispatch, claim, retry, execute, fetch ESI, write to EVE, mutate roles or access, or call external services.';

function derivedHandoff(followUp: LeadershipFollowUp): PeopleFollowUpHandoff {
  const decisionStatus = followUp.sourceContext.decisionStatus;
  const queueReady = decisionStatus === 'approved';

  return {
    followUpId: followUp.id,
    memberProfileId: followUp.memberProfileId,
    memberDisplayName: followUp.memberDisplayName,
    decisionId: followUp.sourceContext.decisionId,
    decisionStatus,
    approvalRequired: decisionStatus === 'proposed',
    queueReady,
    queueItemId: followUp.sourceContext.queueItemId,
    queueStatus: followUp.sourceContext.queueStatus,
    message: followUp.sourceContext.decisionId
      ? queueReady
        ? `Decision ${followUp.sourceContext.decisionId} is approved and ready for separate queued work.`
        : `Decision ${followUp.sourceContext.decisionId} is ${decisionStatus ?? 'linked'}.`
      : 'No decision has been recorded for this People follow-up.',
    boundary:
      'People follow-up handoff only. No queued work, worker dispatch, EVE role/access change, retry, or external execution occurred.',
    missingLinkReasons: followUp.sourceContext.missingLinkReasons
  };
}

function peopleQueuedWorkDetail(handoff: PeopleFollowUpHandoff, workerHandoff?: WorkerHandoff): PeopleQueuedWorkDetail | null {
  if (!handoff.queueItemId) {
    return null;
  }

  return {
    queueItemId: handoff.queueItemId,
    queueStatus: handoff.queueStatus,
    handoffId: workerHandoff?.id,
    handoffStatus: workerHandoff?.status,
    handoffCreatedAt: workerHandoff?.createdAt,
    message: workerHandoff
      ? `Worker handoff ${workerHandoff.id} is ${workerHandoff.status} for People queued work ${handoff.queueItemId}.`
      : `People queued work ${handoff.queueItemId} is ready for explicit worker handoff preparation.`,
    boundary: peopleWorkerHandoffBoundary
  };
}

export function PeopleFollowUpList({
  followUps,
  handoffByFollowUpId,
  statusFilter,
  onCreateQueue,
  onPrepareWorkerHandoff,
  onRecordDecision,
  onStatusFilterChange,
  onUpdateDecisionStatus
}: PeopleFollowUpListProps) {
  const [busyFollowUpId, setBusyFollowUpId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [workerHandoffByQueueItemId, setWorkerHandoffByQueueItemId] = useState<Record<string, WorkerHandoff>>({});

  async function runAction(followUp: LeadershipFollowUp, action: () => Promise<unknown>, successMessage: string) {
    setBusyFollowUpId(followUp.id);
    setActionStatus((current) => ({ ...current, [followUp.id]: '' }));
    try {
      await action();
      setActionStatus((current) => ({ ...current, [followUp.id]: successMessage }));
    } catch (error) {
      setActionStatus((current) => ({
        ...current,
        [followUp.id]: error instanceof Error ? error.message : 'People follow-up action failed.'
      }));
    } finally {
      setBusyFollowUpId(null);
    }
  }

  function recordDecision(followUp: LeadershipFollowUp) {
    return runAction(
      followUp,
      () =>
        onRecordDecision(followUp.id, {
          rationale: followUp.reason,
          expectedResult: `Commander decision recorded from People follow-up for ${followUp.memberDisplayName}.`
        }),
      'People follow-up decision recorded.'
    );
  }

  function updateDecisionStatus(followUp: LeadershipFollowUp, status: UpdatePeopleFollowUpDecisionStatusRequest['status']) {
    return runAction(
      followUp,
      () =>
        onUpdateDecisionStatus(followUp.id, {
          status,
          approvalText:
            status === 'approved'
              ? `Commander approves this People follow-up for queued planning: ${followUp.reason}.`
              : undefined,
          rejectionReason: status === 'rejected' ? `Commander rejected this People follow-up: ${followUp.reason}.` : undefined
        }),
      status === 'approved'
        ? 'People follow-up decision approved. Queue creation remains separate.'
        : 'People follow-up decision rejected. No queued work was created.'
    );
  }

  function createQueue(followUp: LeadershipFollowUp) {
    return runAction(
      followUp,
      () =>
        onCreateQueue(followUp.id, {
          title: `Prepare People follow-up plan: ${followUp.reason}`,
          inputSummary: `Use the approved People decision for ${followUp.memberDisplayName}.`,
          expectedOutput: `Prepare commander review options for People follow-up: ${followUp.reason}.`
        }),
      'People queued work created.'
    );
  }

  function prepareWorkerHandoff(followUp: LeadershipFollowUp, queueItemId: string) {
    return runAction(
      followUp,
      async () => {
        if (!onPrepareWorkerHandoff) {
          throw new Error('People worker handoff preparation is unavailable.');
        }

        const handoff = await onPrepareWorkerHandoff(queueItemId);
        setWorkerHandoffByQueueItemId((current) => ({ ...current, [queueItemId]: handoff }));
      },
      'People worker handoff prepared.'
    );
  }

  return (
    <section aria-label="Leadership follow-ups">
      <h2>Leadership follow-ups</h2>
      <label>
        Follow-up status
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as FollowUpStatus | 'all')}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      {followUps.length === 0 ? (
        <p className="empty-state">No leadership follow-ups are available.</p>
      ) : (
        <ul>
          {followUps.map((followUp) => {
            const handoff = handoffByFollowUpId[followUp.id] ?? derivedHandoff(followUp);
            const hasDecision = Boolean(handoff.decisionId);
            const canApprove = handoff.decisionStatus === 'proposed';
            const canQueue = handoff.queueReady && !handoff.queueItemId;
            const queuedWorkDetail = peopleQueuedWorkDetail(
              handoff,
              handoff.queueItemId ? workerHandoffByQueueItemId[handoff.queueItemId] : undefined
            );
            const busy = busyFollowUpId === followUp.id;

            return (
              <li key={followUp.id}>
                <strong>{followUp.memberDisplayName}</strong>: {followUp.reason} ({followUp.priority}, {followUp.status})
                {followUp.owner ? <span> Owner: {followUp.owner}</span> : null}
                {followUp.isPlayerImpacting ? <span> Player-impacting: explicit approval required before queued work.</span> : null}
                <dl className="metadata-grid" aria-label={`People follow-up handoff for ${followUp.memberDisplayName}`}>
                  <div className="metadata-item">
                    <dt>Decision</dt>
                    <dd>{handoff.decisionId ? `${handoff.decisionId} ${handoff.decisionStatus ?? ''}` : 'not recorded'}</dd>
                  </div>
                  <div className="metadata-item">
                    <dt>Approval</dt>
                    <dd>{handoff.approvalRequired ? 'required' : handoff.queueReady ? 'approved' : 'blocked'}</dd>
                  </div>
                  <div className="metadata-item">
                    <dt>Queue</dt>
                    <dd>{handoff.queueItemId ? `${handoff.queueItemId} ${handoff.queueStatus ?? ''}` : handoff.queueReady ? 'ready' : 'blocked'}</dd>
                  </div>
                </dl>
                <p className="notice">{handoff.message}</p>
                <p className="notice">{handoff.boundary}</p>
                {!hasDecision ? (
                  <button type="button" onClick={() => void recordDecision(followUp)} disabled={busy}>
                    {busy ? 'Recording...' : 'Record decision'}
                  </button>
                ) : null}
                {canApprove ? (
                  <div className="button-row" aria-label={`People decision approval controls for ${followUp.memberDisplayName}`}>
                    <button type="button" onClick={() => void updateDecisionStatus(followUp, 'approved')} disabled={busy}>
                      {busy ? 'Approving...' : 'Approve decision'}
                    </button>
                    <button type="button" onClick={() => void updateDecisionStatus(followUp, 'rejected')} disabled={busy}>
                      {busy ? 'Rejecting...' : 'Reject decision'}
                    </button>
                  </div>
                ) : null}
                {canQueue ? (
                  <button type="button" onClick={() => void createQueue(followUp)} disabled={busy}>
                    {busy ? 'Queueing...' : 'Create queued work'}
                  </button>
                ) : null}
                {queuedWorkDetail ? (
                  <section aria-label={`People queued work detail for ${followUp.memberDisplayName}`}>
                    <h3>People queued work detail</h3>
                    <p>{queuedWorkDetail.message}</p>
                    <dl className="metadata-grid">
                      <div className="metadata-item">
                        <dt>Queue item</dt>
                        <dd>{queuedWorkDetail.queueItemId}</dd>
                      </div>
                      <div className="metadata-item">
                        <dt>Queue status</dt>
                        <dd>{queuedWorkDetail.queueStatus ?? 'unknown'}</dd>
                      </div>
                      <div className="metadata-item">
                        <dt>Worker handoff</dt>
                        <dd>{queuedWorkDetail.handoffId ? `${queuedWorkDetail.handoffId} ${queuedWorkDetail.handoffStatus ?? ''}` : 'not prepared'}</dd>
                      </div>
                      {queuedWorkDetail.handoffCreatedAt ? (
                        <div className="metadata-item">
                          <dt>Handoff created</dt>
                          <dd>{new Date(queuedWorkDetail.handoffCreatedAt).toLocaleString()}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <p className="notice">{queuedWorkDetail.boundary}</p>
                    {!queuedWorkDetail.handoffId && onPrepareWorkerHandoff ? (
                      <button type="button" onClick={() => void prepareWorkerHandoff(followUp, queuedWorkDetail.queueItemId)} disabled={busy}>
                        {busy ? 'Preparing...' : 'Prepare worker handoff'}
                      </button>
                    ) : null}
                  </section>
                ) : null}
                {actionStatus[followUp.id] ? <p className="notice">{actionStatus[followUp.id]}</p> : null}
                {handoff.missingLinkReasons.length > 0 ? (
                  <ul className="missing-reasons">
                    {handoff.missingLinkReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <p className="notice">People follow-up controls prepare decisions and queued work only. They do not change roles, access, EVE state, worker state, retries, or external services.</p>
    </section>
  );
}
