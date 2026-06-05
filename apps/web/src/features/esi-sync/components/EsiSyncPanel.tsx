import { useState } from 'react';
import type {
  EsiSyncDomain,
  EsiSyncStatusResponse,
  CancelRetryResponse,
  PrepareEsiSyncResponse,
  RetryPolicyDelayOption,
  RetryRequestSummary,
  RescheduleRetryResponse,
  RevokeEsiVaultResponse,
  ScheduleRetryResponse,
  StartEsiSyncConsentResponse
} from '@gryyk/contracts';

interface EsiSyncPanelProps {
  error: string | null;
  loading: boolean;
  status: EsiSyncStatusResponse | null;
  onCancelRetry?: (syncRequestId: string, reason: string) => Promise<CancelRetryResponse>;
  onPrepareSync: (domain: EsiSyncDomain) => Promise<PrepareEsiSyncResponse>;
  onRescheduleRetry?: (syncRequestId: string, reason: string, notBefore?: string) => Promise<RescheduleRetryResponse>;
  onRevokeVault: () => Promise<RevokeEsiVaultResponse>;
  onScheduleRetry?: (syncRequestId: string, reason: string) => Promise<ScheduleRetryResponse>;
  onStartConsent: () => Promise<StartEsiSyncConsentResponse>;
}

export function EsiSyncPanel({
  error,
  loading,
  status,
  onPrepareSync,
  onCancelRetry,
  onRescheduleRetry,
  onRevokeVault,
  onScheduleRetry,
  onStartConsent
}: EsiSyncPanelProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function handleStartConsent() {
    setBusyAction('consent');
    try {
      const response = await onStartConsent();
      setActionStatus(`${response.boundary} Requested scopes: ${response.requestedScopes.join(', ')}.`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to start ESI consent.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRevoke() {
    setBusyAction('revoke');
    try {
      const response = await onRevokeVault();
      setActionStatus(`Vault status: ${response.vault.status}. ${response.vault.boundaries.join(' ')}`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to revoke ESI consent.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePrepare(domain: EsiSyncDomain) {
    setBusyAction(`prepare-${domain}`);
    try {
      const response = await onPrepareSync(domain);
      setActionStatus(
        `${response.syncRequest.boundary} Sync status: ${response.syncRequest.status}. Duplicate: ${
          response.duplicate ? 'yes' : 'no'
        }.`
      );
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to prepare ESI sync.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleScheduleRetry(syncRequestId: string) {
    if (!onScheduleRetry) {
      return;
    }

    setBusyAction(`retry-${syncRequestId}`);
    try {
      const response = await onScheduleRetry(syncRequestId, 'Commander approved retry scheduling for failed ESI sync.');
      setActionStatus(`${response.retry.boundary} Retry status: ${response.retry.status}. Duplicate: ${response.duplicate ? 'yes' : 'no'}.`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to schedule ESI sync retry.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleCancelRetry(syncRequestId: string) {
    if (!onCancelRetry) {
      return;
    }

    setBusyAction(`cancel-retry-${syncRequestId}`);
    try {
      const response = await onCancelRetry(syncRequestId, 'Commander canceled retry after policy review.');
      setActionStatus(`${response.retry.boundary} Retry status: ${response.retry.status}.`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to cancel ESI sync retry.');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRescheduleRetry(syncRequestId: string, option: RetryPolicyDelayOption = defaultRetryDelayOption) {
    if (!onRescheduleRetry) {
      return;
    }

    setBusyAction(`reschedule-retry-${syncRequestId}`);
    try {
      const notBefore = retryDelayNotBefore(option);
      const response = await onRescheduleRetry(
        syncRequestId,
        `Commander applied retry policy control "${option.label}" for scheduled ESI sync retry.`,
        notBefore
      );
      setActionStatus(`${response.retry.boundary} Retry status: ${response.retry.status}. Not before: ${response.retry.notBefore ?? 'unset'}.`);
    } catch (actionError) {
      setActionStatus(actionError instanceof Error ? actionError.message : 'Unable to reschedule ESI sync retry.');
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) {
    return <main className="command-brief">Loading ESI sync...</main>;
  }

  if (error) {
    return <main className="command-brief error-state">{error}</main>;
  }

  if (!status) {
    return null;
  }

  const vault = status.vault;

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 ESI Sync</p>
          <h1>ESI token vault</h1>
        </div>
        <span className="status-pill">{vault.status}</span>
      </header>

      <section className="summary" aria-label="ESI vault status">
        <h2>Vault status</h2>
        <dl className="metadata-grid">
          <div className="metadata-item">
            <dt>Character</dt>
            <dd>{vault.character ? vault.character.name : 'No consent'}</dd>
          </div>
          <div className="metadata-item">
            <dt>Corporation</dt>
            <dd>{vault.corporation ? vault.corporation.name : 'No consent'}</dd>
          </div>
          <div className="metadata-item">
            <dt>Granted scopes</dt>
            <dd>{vault.grantedScopes.length}</dd>
          </div>
          <div className="metadata-item">
            <dt>Consented</dt>
            <dd>{vault.consentedAt ? new Date(vault.consentedAt).toLocaleString() : 'Missing'}</dd>
          </div>
          <div className="metadata-item">
            <dt>Revoked</dt>
            <dd>{vault.revokedAt ? new Date(vault.revokedAt).toLocaleString() : 'No'}</dd>
          </div>
        </dl>
        {vault.boundaries.map((boundary) => (
          <p className="notice" key={boundary}>
            {boundary}
          </p>
        ))}
      </section>

      <section aria-label="ESI sync domains">
        <h2>Read-sync domains</h2>
        <div className="coverage-grid">
          {status.domains.map((domain) => (
            <article className={`coverage-item coverage-item-${domain.available ? 'present' : 'missing'}`} key={domain.domain}>
              <span>{domain.label}</span>
              <strong>{domain.available ? 'available' : 'blocked'}</strong>
              <p>Required scopes: {domain.requiredScopes.join(', ')}</p>
              {domain.missingScopes.length > 0 ? <p className="missing-reasons">Missing scopes: {domain.missingScopes.join(', ')}</p> : null}
              <button
                type="button"
                onClick={() => void handlePrepare(domain.domain)}
                disabled={!domain.available || busyAction === `prepare-${domain.domain}`}
              >
                {busyAction === `prepare-${domain.domain}` ? 'Preparing...' : 'Prepare read sync'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="ESI consent controls">
        <h2>Consent controls</h2>
        <div className="form-actions">
          <button type="button" onClick={() => void handleStartConsent()} disabled={busyAction === 'consent'}>
            {busyAction === 'consent' ? 'Starting...' : 'Start read-sync consent'}
          </button>
          <button type="button" onClick={() => void handleRevoke()} disabled={vault.status !== 'active' || busyAction === 'revoke'}>
            {busyAction === 'revoke' ? 'Revoking...' : 'Revoke consent'}
          </button>
        </div>
        {actionStatus ? <p className="notice">{actionStatus}</p> : null}
        <p className="notice">This surface prepares read-only sync requests only. It does not fetch ESI data, dispatch workers, schedule retries, write to EVE, or move wallets, assets, contracts, or roles.</p>
      </section>

      <section aria-label="ESI sync history">
        <h2>Recent sync history</h2>
        {status.history && status.history.length > 0 ? (
          <ul>
            {status.history.map((item) => (
              <li key={item.id}>
                <strong>
                  {item.domain} sync: {item.status}
                </strong>
                <p>Requested: {new Date(item.requestedAt).toLocaleString()}</p>
                {item.claimedBy ? <p>Worker: {item.claimedBy}</p> : null}
                {item.completedAt ? <p>Completed: {new Date(item.completedAt).toLocaleString()}</p> : null}
                {item.snapshotId ? <p>Snapshot: {item.snapshotId}</p> : null}
                {item.sourceCount !== undefined ? <p>Sources: {item.sourceCount}</p> : null}
                {item.sectionStatuses.length > 0 ? (
                  <p>Sections: {item.sectionStatuses.map((section) => `${section.key} ${section.status}`).join(', ')}</p>
                ) : null}
                {item.failure ? <p className="missing-reasons">Failed: {item.failure.reason}</p> : null}
                {item.retry ? (
                  <p>
                    Retry {item.retry.status}: {item.retry.reason}
                    {item.retry.claimedBy ? ` Claimed by ${item.retry.claimedBy}.` : ''}
                    {item.retry.completedAt ? ` Completed ${new Date(item.retry.completedAt).toLocaleString()}.` : ''}
                    {item.retry.canceledAt ? ` Canceled ${new Date(item.retry.canceledAt).toLocaleString()}.` : ''}
                    {item.retry.cancelReason ? ` Reason: ${item.retry.cancelReason}` : ''}
                    {item.retry.result ? ` Replacement ${item.retry.result.replacementTargetId} is ${item.retry.result.replacementTargetStatus}.` : ''}
                    {item.retry.blockedReason ? ` Blocked: ${item.retry.blockedReason}` : ''}
                    {' '}
                    {item.retry.policy.boundary}
                  </p>
                ) : null}
                {item.retryHistory && item.retryHistory.length > 0 ? (
                  <section aria-label={`${item.id} retry history`}>
                    <h3>Retry history</h3>
                    <ul>
                      {item.retryHistory.map((retry) => (
                        <li key={retry.id}>{retryAttemptSummary(retry)}</li>
                      ))}
                    </ul>
                    <p className="notice">Retry history is read-only. This view does not dispatch, execute, fetch ESI, or reschedule work.</p>
                  </section>
                ) : null}
                {item.status === 'failed' ? (
                  <button type="button" disabled={!onScheduleRetry || busyAction === `retry-${item.id}`} onClick={() => void handleScheduleRetry(item.id)}>
                    {busyAction === `retry-${item.id}` ? 'Scheduling...' : 'Schedule retry'}
                  </button>
                ) : null}
                {item.retry ? (
                  <button
                    type="button"
                    disabled={!item.retry.policy.canCancel || !onCancelRetry || busyAction === `cancel-retry-${item.id}`}
                    onClick={() => void handleCancelRetry(item.id)}
                  >
                    {busyAction === `cancel-retry-${item.id}` ? 'Canceling...' : 'Cancel retry'}
                  </button>
                ) : null}
                {item.retry ? (
                  <button
                    type="button"
                    disabled={!item.retry.policy.canReschedule || !onRescheduleRetry || busyAction === `reschedule-retry-${item.id}`}
                    onClick={() => void handleRescheduleRetry(item.id)}
                  >
                    {busyAction === `reschedule-retry-${item.id}` ? 'Rescheduling...' : 'Reschedule retry'}
                  </button>
                ) : null}
                {item.retry?.policy.canReschedule ? (
                  <section aria-label={`${item.id} retry policy controls`}>
                    <h3>Retry policy controls</h3>
                    <div className="form-actions">
                      {item.retry.policy.delayOptions.map((option) => (
                        <button
                          type="button"
                          key={option.key}
                          disabled={!onRescheduleRetry || busyAction === `reschedule-retry-${item.id}`}
                          onClick={() => void handleRescheduleRetry(item.id, option)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className="notice">Retry policy controls update scheduled retry timing only. They do not dispatch, claim, execute, or fetch ESI data.</p>
                  </section>
                ) : null}
                <p className="notice">{item.boundary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent Numbers sync attempts are visible for this corporation scope.</p>
        )}
      </section>
    </main>
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

const defaultRetryDelayOption: RetryPolicyDelayOption = {
  key: 'one_hour',
  label: 'Defer 1 hour',
  delayHours: 1
};

function retryDelayNotBefore(option: RetryPolicyDelayOption): string | undefined {
  if (option.delayHours === 0) {
    return undefined;
  }

  return new Date(Date.now() + option.delayHours * 60 * 60 * 1000).toISOString();
}
