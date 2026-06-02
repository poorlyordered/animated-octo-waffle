import { ObjectId, type Db } from 'mongodb';
import type {
  AutomationQueueItem,
  CreateAutomationQueueItemRequest,
  QueueStatus
} from '../../../packages/contracts/src/index';
import { findDecisionRecord } from './decision-record-store';
import {
  approvalSnapshotFromDecision,
  normalizeAutomationQueueDocument,
  queueProvenanceFromDecision,
  type QueueDocument
} from './automation-queue-normalizer';
import { assertQueueEligibleDecision } from './automation-queue-rules';

const collectionName = 'automation_queue';

function idFilter(id: string, corporationId: string) {
  return ObjectId.isValid(id)
    ? { _id: new ObjectId(id), corporationId }
    : { id, corporationId };
}

export interface ListAutomationQueueFilters {
  status?: QueueStatus;
  sourceDecisionId?: string;
}

export async function listAutomationQueueItems(
  db: Db,
  corporationId: string,
  filters: ListAutomationQueueFilters
): Promise<AutomationQueueItem[]> {
  const query: Record<string, unknown> = { corporationId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.sourceDecisionId) {
    query.sourceDecisionId = filters.sourceDecisionId;
  }

  const documents = await db.collection(collectionName).find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  return documents.map((document) => normalizeAutomationQueueDocument(document as QueueDocument));
}

export async function findAutomationQueueItem(
  db: Db,
  corporationId: string,
  id: string
): Promise<AutomationQueueItem | null> {
  const document = await db.collection(collectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeAutomationQueueDocument(document as QueueDocument) : null;
}

export async function findAutomationQueueItemByDecisionAndIntent(
  db: Db,
  corporationId: string,
  sourceDecisionId: string,
  taskIntent: string
): Promise<AutomationQueueItem | null> {
  const document = await db.collection(collectionName).findOne({
    corporationId,
    sourceDecisionId,
    taskIntent: taskIntent.trim()
  });

  return document ? normalizeAutomationQueueDocument(document as QueueDocument) : null;
}

export async function createAutomationQueueItem(
  db: Db,
  corporationId: string,
  request: CreateAutomationQueueItemRequest
): Promise<AutomationQueueItem | null> {
  const decision = await findDecisionRecord(db, corporationId, request.sourceDecisionId);

  if (!decision) {
    return null;
  }

  assertQueueEligibleDecision(decision);

  const duplicate = await findAutomationQueueItemByDecisionAndIntent(db, corporationId, decision.id, request.taskIntent);

  if (duplicate) {
    throw new Error('Automation queue item already exists for this decision and task intent');
  }

  const now = new Date().toISOString();
  const document = {
    corporationId,
    sourceDecisionId: decision.id,
    taskIntent: request.taskIntent.trim(),
    inputSummary: request.inputSummary.trim(),
    expectedOutput: request.expectedOutput.trim(),
    status: 'queued' satisfies QueueStatus,
    requestedBy: 'commander',
    owner: request.owner?.trim() || undefined,
    isPlayerImpacting: decision.isPlayerImpacting,
    approval: approvalSnapshotFromDecision(decision),
    provenance: queueProvenanceFromDecision(decision, now),
    attempts: 0,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeAutomationQueueDocument({ ...document, _id: result.insertedId } as QueueDocument);
}
