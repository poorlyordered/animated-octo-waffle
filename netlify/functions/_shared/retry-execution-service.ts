import type { Db } from 'mongodb';
import type { RetryExecutionResult } from '../../../packages/contracts/src/index';
import { findActiveVaultById, markVaultLastSync } from './esi-token-vault-store';
import { createRetryReplacementSyncRequest, findSyncRequest } from './esi-sync-request-store';
import {
  blockRetryRequest,
  claimRetryRequest,
  completeRetryRequest,
  findClaimedRetryRequest,
  retryRequestSummary,
  type RetryRequestDocument
} from './retry-request-store';
import { createRetryReplacementWorkerHandoff, findWorkerHandoff } from './worker-handoff-store';

export async function claimRetryForWorker(db: Db, retryId: string, workerId: string): Promise<RetryRequestDocument | null> {
  return claimRetryRequest(db, retryId, workerId);
}

export async function executeRetryForWorker(db: Db, retryId: string, workerId: string): Promise<RetryRequestDocument | null> {
  const retry = (await claimRetryRequest(db, retryId, workerId)) ?? (await findClaimedRetryRequest(db, retryId, workerId));
  if (!retry) {
    return null;
  }

  if (retry.targetType === 'worker_handoff') {
    return executeWorkerHandoffRetry(db, retry, workerId);
  }

  return executeEsiSyncRetry(db, retry, workerId);
}

async function executeWorkerHandoffRetry(
  db: Db,
  retry: RetryRequestDocument,
  workerId: string
): Promise<RetryRequestDocument | null> {
  const retryId = retry.id ?? retry._id?.toString() ?? '';
  const handoff = await findWorkerHandoff(db, retry.corporationId, retry.targetId);

  if (!handoff) {
    return blockRetryRequest(db, retryId, workerId, 'Original worker handoff was not found.');
  }

  if (handoff.status !== 'failed') {
    return blockRetryRequest(db, retryId, workerId, 'Only failed worker handoffs can be retried.');
  }

  const replacement = await createRetryReplacementWorkerHandoff(
    db,
    retry.corporationId,
    handoff,
    retryId,
    workerId
  );

  const result = retryResult(retry, replacement.id, 'ready', 'Prepared replacement worker handoff from commander-approved retry.');
  return completeRetryRequest(db, retryId, workerId, result);
}

async function executeEsiSyncRetry(
  db: Db,
  retry: RetryRequestDocument,
  workerId: string
): Promise<RetryRequestDocument | null> {
  const retryId = retry.id ?? retry._id?.toString() ?? '';
  const syncRequest = await findSyncRequest(db, retry.targetId);

  if (!syncRequest || syncRequest.corporationId !== retry.corporationId) {
    return blockRetryRequest(db, retryId, workerId, 'Original ESI sync request was not found in retry scope.');
  }

  if (syncRequest.status !== 'failed') {
    return blockRetryRequest(db, retryId, workerId, 'Only failed ESI sync requests can be retried.');
  }

  const vault = await findActiveVaultById(db, retry.corporationId, syncRequest.vaultId);
  if (!vault) {
    return blockRetryRequest(db, retryId, workerId, 'Active ESI consent is required before this sync retry can be queued.');
  }

  const missingScopes = syncRequest.requiredScopes.filter((scope) => !vault.grantedScopes.includes(scope));
  if (missingScopes.length > 0) {
    return blockRetryRequest(db, retryId, workerId, 'Required ESI read scopes are missing before this sync retry can be queued.');
  }

  const replacement = await createRetryReplacementSyncRequest(db, syncRequest, retryId, workerId);
  await markVaultLastSync(db, vault, replacement.id ?? '', replacement.domain, replacement.requestedAt);
  const result = retryResult(
    retry,
    replacement.id ?? '',
    'queued',
    'Prepared replacement Numbers ESI sync request from commander-approved retry.'
  );
  return completeRetryRequest(db, retryId, workerId, result);
}

function retryResult(
  retry: RetryRequestDocument,
  replacementTargetId: string,
  replacementTargetStatus: RetryExecutionResult['replacementTargetStatus'],
  summary: string
): Omit<RetryExecutionResult, 'workerId' | 'executedAt'> {
  return {
    targetType: retry.targetType,
    targetId: retry.targetId,
    replacementTargetId,
    replacementTargetStatus,
    summary
  };
}

export { retryRequestSummary };
