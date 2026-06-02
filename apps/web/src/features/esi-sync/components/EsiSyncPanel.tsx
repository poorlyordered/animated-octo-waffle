import { useState } from 'react';
import type {
  EsiSyncDomain,
  EsiSyncStatusResponse,
  PrepareEsiSyncResponse,
  RevokeEsiVaultResponse,
  ScheduleRetryResponse,
  StartEsiSyncConsentResponse
} from '@gryyk/contracts';

interface EsiSyncPanelProps {
  error: string | null;
  loading: boolean;
  status: EsiSyncStatusResponse | null;
  onPrepareSync: (domain: EsiSyncDomain) => Promise<PrepareEsiSyncResponse>;
  onRevokeVault: () => Promise<RevokeEsiVaultResponse>;
  onScheduleRetry?: (syncRequestId: string, reason: string) => Promise<ScheduleRetryResponse>;
  onStartConsent: () => Promise<StartEsiSyncConsentResponse>;
}

export function EsiSyncPanel({
  error,
  loading,
  status,
  onPrepareSync,
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
                {item.retry ? <p>Scheduled retry: {item.retry.reason}</p> : null}
                {item.status === 'failed' ? (
                  <button type="button" disabled={!onScheduleRetry || busyAction === `retry-${item.id}`} onClick={() => void handleScheduleRetry(item.id)}>
                    {busyAction === `retry-${item.id}` ? 'Scheduling...' : 'Schedule retry'}
                  </button>
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
