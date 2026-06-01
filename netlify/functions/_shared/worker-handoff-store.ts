import { ObjectId, type Db } from 'mongodb';
import type { WorkerHandoff, WorkerHandoffStatus } from '../../../packages/contracts/src/index';
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

  const documents = await db.collection(collectionName).find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  return documents.map((document) => normalizeWorkerHandoffDocument(document as WorkerHandoffDocument));
}

export async function findWorkerHandoff(
  db: Db,
  corporationId: string,
  id: string
): Promise<WorkerHandoff | null> {
  const document = await db.collection(collectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeWorkerHandoffDocument(document as WorkerHandoffDocument) : null;
}

export async function findActiveWorkerHandoff(
  db: Db,
  corporationId: string,
  queueItemId: string
): Promise<WorkerHandoff | null> {
  const document = await db.collection(collectionName).findOne({
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
    .collection(collectionName)
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
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeWorkerHandoffDocument({ ...document, _id: result.insertedId } as WorkerHandoffDocument);
}

export { workerHandoffSummaryFromHandoff };
