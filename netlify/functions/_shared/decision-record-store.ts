import { ObjectId, type Db } from 'mongodb';
import type {
  ApprovalRecord,
  CreateDecisionRecordRequest,
  DecisionRecord,
  NumbersFollowUpOrigin,
  NumbersSnapshot,
  NumbersFollowUpCandidate,
  DecisionStatus,
  UpdateDecisionStatusRequest
} from '../../../packages/contracts/src/index';
import {
  normalizeDecisionRecordDocument,
  normalizeSourceBriefDocument,
  sourceProvenanceFromBrief,
  type DecisionDocument
} from './decision-record-normalizer';
import { assertApprovalBoundary, assertDecisionTransition } from './decision-record-rules';

const collectionName = 'strategic_decisions';

function idFilter(id: string, corporationId: string) {
  return ObjectId.isValid(id)
    ? { _id: new ObjectId(id), corporationId }
    : { id, corporationId };
}

export interface ListDecisionFilters {
  sourceBriefId?: string;
  status?: DecisionStatus;
}

export async function listDecisionRecords(
  db: Db,
  corporationId: string,
  filters: ListDecisionFilters
): Promise<DecisionRecord[]> {
  const query: Record<string, unknown> = { corporationId };

  if (filters.sourceBriefId) {
    query.$or = [{ sourceBriefId: filters.sourceBriefId }, { researchBriefId: filters.sourceBriefId }];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const documents = await db.collection(collectionName).find(query).sort({ updatedAt: -1, timestamp: -1 }).toArray();
  return documents.map((document) => normalizeDecisionRecordDocument(document as DecisionDocument));
}

export async function findDecisionRecord(db: Db, corporationId: string, id: string): Promise<DecisionRecord | null> {
  const document = await db.collection(collectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeDecisionRecordDocument(document as DecisionDocument) : null;
}

export async function findDecisionRecordByNumbersFollowUpOrigin(
  db: Db,
  corporationId: string,
  origin: Pick<NumbersFollowUpOrigin, 'snapshotId' | 'candidateId'>
): Promise<DecisionRecord | null> {
  const document = await db.collection(collectionName).findOne({
    corporationId,
    'sourceContext.sourceType': 'numbers_follow_up',
    'sourceContext.snapshotId': origin.snapshotId,
    'sourceContext.candidateId': origin.candidateId
  });

  return document ? normalizeDecisionRecordDocument(document as DecisionDocument) : null;
}

export async function createDecisionRecord(
  db: Db,
  corporationId: string,
  request: CreateDecisionRecordRequest
): Promise<DecisionRecord | null> {
  const sourceBriefQuery: Record<string, unknown> = {
    corporationId,
    $or: ObjectId.isValid(request.sourceBriefId)
      ? [{ id: request.sourceBriefId }, { _id: new ObjectId(request.sourceBriefId) }]
      : [{ id: request.sourceBriefId }]
  };
  const sourceBrief = await db.collection('research_briefs').findOne(sourceBriefQuery);

  if (!sourceBrief) {
    return null;
  }

  const brief = normalizeSourceBriefDocument(sourceBrief);
  const now = new Date().toISOString();
  const document = {
    corporationId,
    sourceBriefId: brief.id,
    researchBriefId: brief.id,
    sourceRecommendation: request.sourceRecommendation,
    sourceProvenance: sourceProvenanceFromBrief(brief),
    status: 'proposed' satisfies DecisionStatus,
    rationale: request.rationale,
    expectedResult: request.expectedResult,
    isPlayerImpacting: request.isPlayerImpacting,
    approval: null,
    statusHistory: [
      {
        toStatus: 'proposed' satisfies DecisionStatus,
        changedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeDecisionRecordDocument({ ...document, _id: result.insertedId } as DecisionDocument);
}

export async function createDecisionRecordFromNumbersFollowUp(
  db: Db,
  corporationId: string,
  snapshot: NumbersSnapshot,
  candidate: NumbersFollowUpCandidate,
  origin: NumbersFollowUpOrigin,
  expectedResult?: string
): Promise<DecisionRecord> {
  const duplicate = await findDecisionRecordByNumbersFollowUpOrigin(db, corporationId, origin);

  if (duplicate) {
    return duplicate;
  }

  const now = new Date().toISOString();
  const document = {
    corporationId,
    sourceBriefId: snapshot.id,
    researchBriefId: snapshot.id,
    sourceRecommendation: candidate.title,
    sourceContext: origin,
    sourceProvenance: {
      briefId: snapshot.id,
      briefCreatedAt: snapshot.createdAt,
      focus: snapshot.focus,
      model: snapshot.provenance.model ?? 'unknown',
      promptVersion: snapshot.provenance.promptVersion ?? 'unknown',
      confidence: snapshot.provenance.confidence ?? 0,
      sourceCount: snapshot.provenance.sourceCount,
      sourceReferences: snapshot.provenance.sourceReferences,
      coverage: snapshot.coverage ?? {
        numbers: 'present',
        opportunity: 'missing',
        people: 'missing',
        missingReasons: ['Numbers follow-up did not include opportunity or people coverage metadata.']
      }
    },
    status: 'proposed' satisfies DecisionStatus,
    rationale: candidate.rationale,
    expectedResult:
      expectedResult?.trim() ||
      `Commander decision recorded from Numbers follow-up: ${candidate.title}. No execution has been performed.`,
    isPlayerImpacting: candidate.isPlayerImpacting,
    approval: null,
    statusHistory: [
      {
        toStatus: 'proposed' satisfies DecisionStatus,
        changedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeDecisionRecordDocument({ ...document, _id: result.insertedId } as DecisionDocument);
}

export async function updateDecisionStatus(
  db: Db,
  corporationId: string,
  id: string,
  request: UpdateDecisionStatusRequest
): Promise<DecisionRecord | null> {
  const current = await findDecisionRecord(db, corporationId, id);

  if (!current) {
    return null;
  }

  assertDecisionTransition(current.status, request.status);
  assertApprovalBoundary(current.isPlayerImpacting, request.status, current.approval?.approvalText ?? request.approvalText);

  const now = new Date().toISOString();
  const approval: ApprovalRecord | null =
    request.approvalText?.trim()
      ? {
          approvedAt: now,
          approvalText: request.approvalText.trim()
        }
      : current.approval;
  const historyEntry = {
    fromStatus: current.status,
    toStatus: request.status,
    changedAt: now,
    note: request.note
  };

  await db.collection(collectionName).updateOne(idFilter(id, corporationId), {
    $set: {
      status: request.status,
      approval,
      updatedAt: now
    },
    $push: {
      statusHistory: historyEntry
    }
  } as never);

  return findDecisionRecord(db, corporationId, id);
}
