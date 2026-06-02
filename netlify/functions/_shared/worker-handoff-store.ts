import { ObjectId, type Db, type UpdateFilter } from 'mongodb';
import type {
  WorkerCompleteRequest,
  WorkerFailRequest,
  WorkerHandoff,
  WorkerHandoffStatus,
  WorkerProgressRequest
} from '../../../packages/contracts/src/index';
import { findAutomationQueueItem } from './automation-queue-store';
import {
  normalizeWorkerHandoffDocument,
  payloadSummaryFromQueueItem,
  workerHandoffSummaryFromHandoff,
  type WorkerHandoffDocument
} from './worker-handoff-normalizer';
import { assertQueueEligibleForHandoff } from './worker-handoff-rules';

const collectionName = 'worker_handoffs';
const activeStatuses: WorkerHandoffStatus[] = ['ready', 'claimed', 'blocked'];

function idFilter(id: string, corporationId: string) {
  return ObjectId.isValid(id)
    ? { _id: new ObjectId(id), corporationId }
    : { id, corporationId };
}

export interface ListWorkerHandoffFilters {
  status?: WorkerHandoffStatus;
  queueItemId?: string;
}

export async function listWorkerHandoffs(
  db: Db,
  corporationId: string,
  filters: ListWorkerHandoffFilters = {}
): Promise<WorkerHandoff[]> {
  const query: Record<string, unknown> = { corporationId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.queueItemId) {
    query.queueItemId = filters.queueItemId;
  }

  const documents = await db.collection<WorkerHandoffDocument>(collectionName).find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  return documents.map((document) => normalizeWorkerHandoffDocument(document as WorkerHandoffDocument));
}

export async function findWorkerHandoff(
  db: Db,
  corporationId: string,
  id: string
): Promise<WorkerHandoff | null> {
  const document = await db.collection<WorkerHandoffDocument>(collectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeWorkerHandoffDocument(document as WorkerHandoffDocument) : null;
}

export async function findActiveWorkerHandoff(
  db: Db,
  corporationId: string,
  queueItemId: string
): Promise<WorkerHandoff | null> {
  const document = await db.collection<WorkerHandoffDocument>(collectionName).findOne({
    corporationId,
    queueItemId,
    status: { $in: activeStatuses }
  });
  return document ? normalizeWorkerHandoffDocument(document as WorkerHandoffDocument) : null;
}

export async function findLatestWorkerHandoff(
  db: Db,
  corporationId: string,
  queueItemId: string
): Promise<WorkerHandoff | null> {
  const document = await db
    .collection<WorkerHandoffDocument>(collectionName)
    .find({ corporationId, queueItemId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(1)
    .next();
  return document ? normalizeWorkerHandoffDocument(document as WorkerHandoffDocument) : null;
}

export async function prepareWorkerHandoff(
  db: Db,
  corporationId: string,
  queueItemId: string,
  createdBy = 'commander'
): Promise<WorkerHandoff | null> {
  const queueItem = await findAutomationQueueItem(db, corporationId, queueItemId);

  if (!queueItem) {
    return null;
  }

  assertQueueEligibleForHandoff(queueItem);

  const activeHandoff = await findActiveWorkerHandoff(db, corporationId, queueItem.id);
  if (activeHandoff) {
    return activeHandoff;
  }

  const now = new Date().toISOString();
  const document = {
    corporationId,
    queueItemId: queueItem.id,
    sourceDecisionId: queueItem.sourceDecisionId,
    status: 'ready' satisfies WorkerHandoffStatus,
    payloadSummary: payloadSummaryFromQueueItem(queueItem),
    createdBy,
    createdAt: now,
    updatedAt: now,
    progress: []
  };

  const result = await db.collection<WorkerHandoffDocument>(collectionName).insertOne(document);
  return normalizeWorkerHandoffDocument({ ...document, _id: result.insertedId } as WorkerHandoffDocument);
}

export async function createRetryReplacementWorkerHandoff(
  db: Db,
  corporationId: string,
  failedHandoff: WorkerHandoff,
  retryRequestId: string,
  workerId: string
): Promise<WorkerHandoff> {
  const now = new Date().toISOString();
  const document = {
    corporationId,
    queueItemId: failedHandoff.queueItemId,
    sourceDecisionId: failedHandoff.sourceDecisionId,
    status: 'ready' satisfies WorkerHandoffStatus,
    payloadSummary: failedHandoff.payloadSummary,
    createdBy: `retry-worker:${workerId}`,
    createdAt: now,
    updatedAt: now,
    retrySource: {
      retryRequestId,
      originalHandoffId: failedHandoff.id
    },
    progress: []
  };

  const result = await db.collection<WorkerHandoffDocument>(collectionName).insertOne(document);
  return normalizeWorkerHandoffDocument({ ...document, _id: result.insertedId } as WorkerHandoffDocument);
}

export async function claimWorkerHandoff(
  db: Db,
  corporationId: string,
  id: string,
  workerId: string
): Promise<WorkerHandoff | null> {
  const now = new Date().toISOString();
  const result = await db.collection<WorkerHandoffDocument>(collectionName).findOneAndUpdate(
    {
      ...idFilter(id, corporationId),
      status: 'ready'
    },
    {
      $set: {
        status: 'claimed' satisfies WorkerHandoffStatus,
        claimedBy: workerId,
        claimedAt: now,
        updatedAt: now
      },
      $setOnInsert: {
        progress: []
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeWorkerHandoffDocument(result as WorkerHandoffDocument) : null;
}

export async function recordWorkerProgress(
  db: Db,
  corporationId: string,
  id: string,
  request: WorkerProgressRequest
): Promise<WorkerHandoff | null> {
  const now = new Date().toISOString();
  const result = await db.collection<WorkerHandoffDocument>(collectionName).findOneAndUpdate(
    claimedByWorkerFilter(id, corporationId, request.workerId),
    {
      $push: {
        progress: {
          workerId: request.workerId,
          message: request.message,
          code: request.code,
          createdAt: now
        }
      },
      $set: { updatedAt: now }
    } as unknown as UpdateFilter<WorkerHandoffDocument>,
    { returnDocument: 'after' }
  );

  return result ? normalizeWorkerHandoffDocument(result as WorkerHandoffDocument) : null;
}

export async function completeWorkerHandoff(
  db: Db,
  corporationId: string,
  id: string,
  request: WorkerCompleteRequest
): Promise<WorkerHandoff | null> {
  const now = new Date().toISOString();
  const result = await db.collection<WorkerHandoffDocument>(collectionName).findOneAndUpdate(
    claimedByWorkerFilter(id, corporationId, request.workerId),
    {
      $set: {
        status: 'completed' satisfies WorkerHandoffStatus,
        completedAt: now,
        updatedAt: now,
        result: {
          workerId: request.workerId,
          summary: request.summary,
          artifactRefs: request.artifactRefs ?? [],
          completedAt: now
        }
      },
      $unset: { failure: '' }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeWorkerHandoffDocument(result as WorkerHandoffDocument) : null;
}

export async function failWorkerHandoff(
  db: Db,
  corporationId: string,
  id: string,
  request: WorkerFailRequest
): Promise<WorkerHandoff | null> {
  const now = new Date().toISOString();
  const result = await db.collection<WorkerHandoffDocument>(collectionName).findOneAndUpdate(
    claimedByWorkerFilter(id, corporationId, request.workerId),
    {
      $set: {
        status: 'failed' satisfies WorkerHandoffStatus,
        updatedAt: now,
        failure: {
          workerId: request.workerId,
          message: request.message,
          code: request.code,
          failedAt: now
        }
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeWorkerHandoffDocument(result as WorkerHandoffDocument) : null;
}

function claimedByWorkerFilter(id: string, corporationId: string, workerId: string) {
  return {
    ...idFilter(id, corporationId),
    status: 'claimed',
    claimedBy: workerId
  };
}

export { workerHandoffSummaryFromHandoff };
