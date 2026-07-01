import { ObjectId, type Db } from 'mongodb';
import {
  brainPromptVersion,
  defaultBrainFocus,
  type BrainRunSummary,
  type ResearchStatus
} from '../../../packages/contracts/src/index';

const requestCollection = 'research_requests';
const briefCollection = 'research_briefs';

export function brainRunSummary(document: Record<string, unknown>): BrainRunSummary {
  return {
    id: stringValue(document.id, objectId(document._id)),
    corporationId: stringValue(document.corporationId, 'unknown'),
    focus: stringValue(document.focus, defaultBrainFocus),
    status: researchStatus(document.status),
    provider: 'openrouter',
    model: stringValue(document.model, 'unknown'),
    promptVersion: stringValue(document.promptVersion, brainPromptVersion),
    createdAt: dateValue(document.createdAt),
    updatedAt: dateValue(document.updatedAt),
    completedAt: optionalDateValue(document.completedAt),
    failedAt: optionalDateValue(document.failedAt),
    errorMessage: typeof document.errorMessage === 'string' ? document.errorMessage : null
  };
}

export async function createBrainRun(
  db: Db,
  input: { corporationId: string; focus?: string; workerId: string; reason?: string; now?: Date }
) {
  const now = input.now ?? new Date();
  const id = new ObjectId();
  const document = {
    _id: id,
    id: id.toHexString(),
    corporationId: input.corporationId,
    focus: input.focus ?? defaultBrainFocus,
    status: 'processing',
    provider: 'openrouter',
    model: 'pending',
    promptVersion: brainPromptVersion,
    requestedBy: input.workerId,
    workerId: input.workerId,
    reason: input.reason,
    createdAt: now,
    updatedAt: now,
    claimedAt: now
  };

  await db.collection(requestCollection).insertOne(document);
  return document;
}

export async function completeBrainRun(
  db: Db,
  runId: string,
  input: { model: string; briefDocument: Record<string, unknown>; now?: Date }
) {
  const now = input.now ?? new Date();
  await db.collection(briefCollection).insertOne(input.briefDocument);
  await db.collection(requestCollection).updateOne(
    { id: runId },
    {
      $set: {
        status: 'processed',
        model: input.model,
        updatedAt: now,
        completedAt: now,
        sourceBriefId: input.briefDocument.id
      },
      $unset: { errorMessage: '' }
    }
  );

  const updated = await db.collection(requestCollection).findOne({ id: runId });
  return updated ? brainRunSummary(updated) : null;
}

export async function failBrainRun(db: Db, runId: string, message: string, now = new Date()) {
  await db.collection(requestCollection).updateOne(
    { id: runId },
    {
      $set: {
        status: 'failed',
        updatedAt: now,
        failedAt: now,
        errorMessage: safeErrorMessage(message)
      }
    }
  );

  const updated = await db.collection(requestCollection).findOne({ id: runId });
  return updated ? brainRunSummary(updated) : null;
}

export async function latestBrainRun(db: Db, corporationId: string, focus = defaultBrainFocus) {
  const document = await db.collection(requestCollection).find({ corporationId, focus }).sort({ updatedAt: -1, createdAt: -1 }).limit(1).next();
  return document ? brainRunSummary(document) : null;
}

function safeErrorMessage(message: string) {
  return message.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]').slice(0, 500);
}

function researchStatus(value: unknown): ResearchStatus {
  return value === 'queued' || value === 'raw_captured' || value === 'processing' || value === 'processed' || value === 'failed'
    ? value
    : 'failed';
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function objectId(value: unknown): string {
  return value instanceof ObjectId ? value.toHexString() : 'unknown';
}

function dateValue(value: unknown): string {
  return optionalDateValue(value) ?? new Date(0).toISOString();
}

function optionalDateValue(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  return undefined;
}
