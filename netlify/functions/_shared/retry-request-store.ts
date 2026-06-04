import { ObjectId, type Db } from 'mongodb';
import type {
  CancelRetryRequest,
  RetryExecutionResult,
  RetryPolicySummary,
  RetryRequestSummary,
  RetryRequestStatus,
  RetryTargetType,
  RescheduleRetryRequest,
  ScheduleRetryRequest
} from '../../../packages/contracts/src/index';

const collectionName = 'retry_requests';
export const defaultRetryHistoryLimit = 5;
const retryScheduledBoundary = 'Retry scheduled only. No worker was dispatched and no execution occurred.';
const retryWorkerBoundary = 'Retry execution is worker-only and uses prior commander approval.';
const retryCanceledBoundary = 'Retry canceled by commander. No worker was dispatched and no execution occurred.';
const retryPolicyBoundary =
  'Retry policy: one active scheduled retry is allowed per target. Scheduled and blocked retries can be canceled; claimed and completed retries cannot.';
const unsafeRetryFields = new Set([
  'accessToken',
  'refreshToken',
  'token',
  'tokens',
  'corporationId',
  'dispatchTarget',
  'dispatchNow',
  'executeNow',
  'runNow',
  'retryNow',
  'walletAction',
  'assetAction',
  'contractAction',
  'roleChange',
  'externalMutation'
]);

export interface RetryRequestDocument {
  _id?: { toString(): string };
  id?: string;
  corporationId: string;
  targetType: RetryTargetType;
  targetId: string;
  status: RetryRequestStatus;
  reason: string;
  notBefore?: string;
  createdBy: string;
  createdAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  blockedAt?: string;
  blockedReason?: string;
  canceledAt?: string;
  canceledBy?: string;
  cancelReason?: string;
  result?: RetryExecutionResult;
  updatedAt: string;
}

export function assertNoUnsafeRetryFields(value: unknown): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  for (const key of Object.keys(value)) {
    if (unsafeRetryFields.has(key)) {
      throw new Error(`Unsafe retry field rejected: ${key}`);
    }
  }
}

export async function findScheduledRetryRequest(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string
): Promise<RetryRequestDocument | null> {
  const document = await db.collection(collectionName).findOne({
    corporationId,
    targetType,
    targetId,
    status: 'scheduled'
  });

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function findLatestRetryRequest(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string
): Promise<RetryRequestDocument | null> {
  const document = await db
    .collection(collectionName)
    .find({ corporationId, targetType, targetId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(1)
    .next();

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function listRetryRequestsForTarget(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string,
  limit = defaultRetryHistoryLimit
): Promise<RetryRequestDocument[]> {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 10);
  const documents = await db
    .collection(collectionName)
    .find({ corporationId, targetType, targetId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(boundedLimit)
    .toArray();

  return documents.map((document) => normalizeRetryRequestDocument(document as unknown as RetryRequestDocument));
}

export async function findRetryRequest(db: Db, id: string): Promise<RetryRequestDocument | null> {
  const document = await db.collection(collectionName).findOne(retryTargetIdFilter(id));
  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function listDueScheduledRetryRequests(db: Db, now = new Date()): Promise<RetryRequestDocument[]> {
  const nowIso = now.toISOString();
  const documents = await db
    .collection(collectionName)
    .find({
      status: 'scheduled',
      $or: [{ notBefore: { $exists: false } }, { notBefore: { $lte: nowIso } }]
    })
    .sort({ notBefore: 1, createdAt: 1 })
    .limit(25)
    .toArray();

  return documents.map((document) => normalizeRetryRequestDocument(document as unknown as RetryRequestDocument));
}

export async function createOrFindScheduledRetryRequest(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string,
  request: ScheduleRetryRequest,
  createdBy = 'commander'
): Promise<{ retry: RetryRequestDocument; duplicate: boolean }> {
  const existing = await findScheduledRetryRequest(db, corporationId, targetType, targetId);
  if (existing) {
    return { retry: existing, duplicate: true };
  }

  const now = new Date().toISOString();
  const document: Omit<RetryRequestDocument, '_id' | 'id'> = {
    corporationId,
    targetType,
    targetId,
    status: 'scheduled',
    reason: request.reason,
    createdBy,
    createdAt: now,
    updatedAt: now
  };

  if (request.notBefore) {
    document.notBefore = request.notBefore;
  }

  const result = await db.collection(collectionName).insertOne(document);
  return {
    retry: normalizeRetryRequestDocument({ ...document, _id: result.insertedId } as RetryRequestDocument),
    duplicate: false
  };
}

export function retryRequestSummary(retry: RetryRequestDocument): RetryRequestSummary {
  const summary: RetryRequestSummary = {
    id: retry.id ?? retry._id?.toString() ?? '',
    targetType: retry.targetType,
    targetId: retry.targetId,
    status: retry.status,
    reason: retry.reason,
    createdAt: retry.createdAt,
    policy: retryPolicySummary(retry),
    boundary: retryBoundary(retry.status)
  };

  if (retry.notBefore) {
    summary.notBefore = retry.notBefore;
  }
  if (retry.claimedBy) {
    summary.claimedBy = retry.claimedBy;
  }
  if (retry.claimedAt) {
    summary.claimedAt = retry.claimedAt;
  }
  if (retry.completedAt) {
    summary.completedAt = retry.completedAt;
  }
  if (retry.blockedAt) {
    summary.blockedAt = retry.blockedAt;
  }
  if (retry.blockedReason) {
    summary.blockedReason = retry.blockedReason;
  }
  if (retry.canceledAt) {
    summary.canceledAt = retry.canceledAt;
  }
  if (retry.canceledBy) {
    summary.canceledBy = retry.canceledBy;
  }
  if (retry.cancelReason) {
    summary.cancelReason = retry.cancelReason;
  }
  if (retry.result) {
    summary.result = retry.result;
  }

  return summary;
}

export function retryPolicySummary(retry: Pick<RetryRequestDocument, 'status'>): RetryPolicySummary {
  return {
    canSchedule: retry.status !== 'scheduled' && retry.status !== 'claimed',
    canCancel: retry.status === 'scheduled' || retry.status === 'blocked',
    canReschedule: retry.status === 'scheduled',
    activeScheduledLimit: 1,
    cancelableStatuses: ['scheduled', 'blocked'],
    boundary: retryPolicyBoundary
  };
}

function retryBoundary(status: RetryRequestStatus): string {
  if (status === 'scheduled') {
    return retryScheduledBoundary;
  }

  if (status === 'canceled') {
    return retryCanceledBoundary;
  }

  return retryWorkerBoundary;
}

export async function rescheduleLatestRetryRequestForTarget(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string,
  request: RescheduleRetryRequest,
  now = new Date()
): Promise<RetryRequestDocument | null> {
  const nowIso = now.toISOString();
  const set: Partial<RetryRequestDocument> = {
    reason: request.reason,
    updatedAt: nowIso
  };
  const unset: Record<string, string> = {};

  if (request.notBefore) {
    set.notBefore = request.notBefore;
  } else {
    unset.notBefore = '';
  }

  const update = Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set };
  const document = await db.collection(collectionName).findOneAndUpdate(
    {
      corporationId,
      targetType,
      targetId,
      status: 'scheduled'
    },
    update,
    { sort: { updatedAt: -1, createdAt: -1 }, returnDocument: 'after' }
  );

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function cancelLatestRetryRequestForTarget(
  db: Db,
  corporationId: string,
  targetType: RetryTargetType,
  targetId: string,
  request: CancelRetryRequest,
  canceledBy = 'commander',
  now = new Date()
): Promise<RetryRequestDocument | null> {
  const nowIso = now.toISOString();
  const document = await db.collection(collectionName).findOneAndUpdate(
    {
      corporationId,
      targetType,
      targetId,
      status: { $in: ['scheduled', 'blocked'] satisfies RetryRequestStatus[] }
    },
    {
      $set: {
        status: 'canceled' satisfies RetryRequestStatus,
        canceledAt: nowIso,
        canceledBy,
        cancelReason: request.reason,
        updatedAt: nowIso
      }
    },
    { sort: { updatedAt: -1, createdAt: -1 }, returnDocument: 'after' }
  );

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function claimRetryRequest(
  db: Db,
  id: string,
  workerId: string,
  now = new Date()
): Promise<RetryRequestDocument | null> {
  const nowIso = now.toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...retryTargetIdFilter(id),
      status: 'scheduled',
      $or: [{ notBefore: { $exists: false } }, { notBefore: { $lte: nowIso } }]
    },
    {
      $set: {
        status: 'claimed' satisfies RetryRequestStatus,
        claimedBy: workerId,
        claimedAt: nowIso,
        updatedAt: nowIso
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeRetryRequestDocument(result as unknown as RetryRequestDocument) : null;
}

export async function findClaimedRetryRequest(
  db: Db,
  id: string,
  workerId: string
): Promise<RetryRequestDocument | null> {
  const document = await db.collection(collectionName).findOne({
    ...retryTargetIdFilter(id),
    status: 'claimed',
    claimedBy: workerId
  });

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function completeRetryRequest(
  db: Db,
  id: string,
  workerId: string,
  resultSummary: Omit<RetryExecutionResult, 'workerId' | 'executedAt'>,
  now = new Date()
): Promise<RetryRequestDocument | null> {
  const nowIso = now.toISOString();
  const result: RetryExecutionResult = {
    ...resultSummary,
    workerId,
    executedAt: nowIso
  };
  const document = await db.collection(collectionName).findOneAndUpdate(
    {
      ...retryTargetIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'completed' satisfies RetryRequestStatus,
        completedAt: nowIso,
        result,
        updatedAt: nowIso
      },
      $unset: { blockedReason: '', blockedAt: '' }
    },
    { returnDocument: 'after' }
  );

  return document ? normalizeRetryRequestDocument(document as unknown as RetryRequestDocument) : null;
}

export async function blockRetryRequest(
  db: Db,
  id: string,
  workerId: string,
  reason: string,
  now = new Date()
): Promise<RetryRequestDocument | null> {
  const nowIso = now.toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...retryTargetIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'blocked' satisfies RetryRequestStatus,
        blockedAt: nowIso,
        blockedReason: reason,
        updatedAt: nowIso
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeRetryRequestDocument(result as unknown as RetryRequestDocument) : null;
}

function normalizeRetryRequestDocument(document: RetryRequestDocument): RetryRequestDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}

export function retryTargetIdFilter(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
}
