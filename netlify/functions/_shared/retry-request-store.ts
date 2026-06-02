import { ObjectId, type Db } from 'mongodb';
import type {
  RetryRequestSummary,
  RetryTargetType,
  ScheduleRetryRequest
} from '../../../packages/contracts/src/index';

const collectionName = 'retry_requests';
const retryBoundary = 'Retry scheduled only. No worker was dispatched and no execution occurred.';
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
  status: 'scheduled';
  reason: string;
  notBefore?: string;
  createdBy: string;
  createdAt: string;
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
    boundary: retryBoundary
  };

  if (retry.notBefore) {
    summary.notBefore = retry.notBefore;
  }

  return summary;
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
