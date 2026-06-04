import { useState } from 'react';
import type {
  AutomationQueueItem,
  CancelRetryResponse,
  RetryRequestSummary,
  ScheduleRetryResponse,
  WorkerHandoffSummary
} from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';

interface AutomationQueueDetailProps {
  queueItem: AutomationQueueItem | null;
  handoff?: WorkerHandoffSummary;
  onCancelHandoffRetry?: (handoffId: string, reason: string) => Promise<CancelRetryResponse>;
  onPrepareHandoff: (queueItemId: string) => Promise<unknown>;
  onScheduleHandoffRetry?: (handoffId: string, reason: string) => Promise<ScheduleRetryResponse>;
}

export function AutomationQueueDetail({
  queueItem,
  handoff,
  onCancelHandoffRetry,
  onPrepareHandoff,
  onScheduleHandoffRetry
}: AutomationQueueDetailProps) {
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [retryBusy, setRetryBusy] = useState(false);

  if (!queueItem) {
    return <section className="empty-state">Select queued work.</section>;
  }

  const canPrepareHandoff = queueItem.status !== 'completed' && queueItem.status !== 'canceled';
  const canScheduleRetry = handoff?.status === 'failed' && Boolean(onScheduleHandoffRetry);
  const canCancelRetry = Boolean(handoff?.retry?.policy.canCancel && onCancelHandoffRetry);

  async function handleScheduleRetry() {
    if (!handoff || !onScheduleHandoffRetry) {
      return;
    }

    setRetryBusy(true);
    try {
      const response = await onScheduleHandoffRetry(handoff.id, 'Commander approved retry scheduling for failed worker handoff.');
      setRetryStatus(`${response.retry.boundary} Retry status: ${response.retry.status}. Duplicate: ${response.duplicate ? 'yes' : 'no'}.`);
    } catch (error) {
      setRetryStatus(error instanceof Error ? error.message : 'Unable to schedule retry.');
    } finally {
      setRetryBusy(false);
    }
  }

  async function handleCancelRetry() {
    if (!handoff || !onCancelHandoffRetry) {
      return;
    }

    setRetryBusy(true);
    try {
      const response = await onCancelHandoffRetry(handoff.id, 'Commander canceled retry after policy review.');
      setRetryStatus(`${response.retry.boundary} Retry status: ${response.retry.status}.`);
    } catch (error) {
      setRetryStatus(error instanceof Error ? error.message : 'Unable to cancel retry.');
    } finally {
      setRetryBusy(false);
    }
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

      <section aria-label="Worker handoff">
        <h3>Worker handoff</h3>
        {handoff ? (
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{handoff.status}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(handoff.createdAt).toLocaleString()}</dd>
            </div>
            {handoff.claimedBy ? (
              <div>
                <dt>Claimed by</dt>
                <dd>{handoff.claimedBy}</dd>
              </div>
            ) : null}
            {handoff.claimedAt ? (
              <div>
                <dt>Claimed</dt>
                <dd>{new Date(handoff.claimedAt).toLocaleString()}</dd>
              </div>
            ) : null}
            {handoff.progress.length > 0 ? (
              <div>
                <dt>Progress</dt>
                <dd>
                  <ul>
                    {handoff.progress.map((event) => (
                      <li key={`${event.workerId}-${event.createdAt}`}>
                        {event.message}
                        {event.code ? ` (${event.code})` : ''}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {handoff.result ? (
              <div>
                <dt>Result</dt>
                <dd>{handoff.result.summary}</dd>
              </div>
            ) : null}
            {handoff.failure ? (
              <div>
                <dt>Failure</dt>
                <dd>{handoff.failure.message}</dd>
              </div>
            ) : null}
            {handoff.retry ? (
              <div>
                <dt>Retry</dt>
                <dd>
                  {handoff.retry.status}: {handoff.retry.reason}
                  {handoff.retry.claimedBy ? ` Claimed by ${handoff.retry.claimedBy}.` : ''}
                  {handoff.retry.completedAt ? ` Completed ${new Date(handoff.retry.completedAt).toLocaleString()}.` : ''}
                  {handoff.retry.canceledAt ? ` Canceled ${new Date(handoff.retry.canceledAt).toLocaleString()}.` : ''}
                  {handoff.retry.cancelReason ? ` Reason: ${handoff.retry.cancelReason}` : ''}
                  {handoff.retry.result ? ` Replacement ${handoff.retry.result.replacementTargetId} is ${handoff.retry.result.replacementTargetStatus}.` : ''}
                  {handoff.retry.blockedReason ? ` Blocked: ${handoff.retry.blockedReason}` : ''}
                  {' '}
                  {handoff.retry.policy.boundary}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p>No worker handoff has been prepared for this queued work.</p>
        )}
        <button type="button" disabled={!canPrepareHandoff} onClick={() => void onPrepareHandoff(queueItem.id)}>
          Prepare handoff
        </button>
        {handoff?.status === 'failed' ? (
          <button type="button" disabled={!canScheduleRetry || retryBusy} onClick={() => void handleScheduleRetry()}>
            {retryBusy ? 'Scheduling...' : 'Schedule retry'}
          </button>
        ) : null}
        {handoff?.retry ? (
          <button type="button" disabled={!canCancelRetry || retryBusy} onClick={() => void handleCancelRetry()}>
            {retryBusy ? 'Canceling...' : 'Cancel retry'}
          </button>
        ) : null}
        {retryStatus ? <p className="notice">{retryStatus}</p> : null}
        {handoff?.retryHistory && handoff.retryHistory.length > 0 ? (
          <section aria-label="Worker handoff retry history">
            <h4>Retry history</h4>
            <ul>
              {handoff.retryHistory.map((retry) => (
                <li key={retry.id}>{retryAttemptSummary(retry)}</li>
              ))}
            </ul>
            <p className="notice">Retry history is read-only. This view does not dispatch, execute, or reschedule work.</p>
          </section>
        ) : null}
        <p className="notice">Preparing handoff creates a durable record only. It does not dispatch, retry, or execute work.</p>
      </section>

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

function retryAttemptSummary(retry: RetryRequestSummary): string {
  const parts = [`${retry.status}: ${retry.reason}`];

  if (retry.claimedBy) parts.push(`Claimed by ${retry.claimedBy}.`);
  if (retry.completedAt) parts.push(`Completed ${new Date(retry.completedAt).toLocaleString()}.`);
  if (retry.canceledAt) parts.push(`Canceled ${new Date(retry.canceledAt).toLocaleString()}.`);
  if (retry.cancelReason) parts.push(`Reason: ${retry.cancelReason}`);
  if (retry.result) parts.push(`Replacement ${retry.result.replacementTargetId} is ${retry.result.replacementTargetStatus}.`);
  if (retry.blockedReason) parts.push(`Blocked: ${retry.blockedReason}`);
  parts.push(retry.policy.boundary);

  return parts.join(' ');
}
