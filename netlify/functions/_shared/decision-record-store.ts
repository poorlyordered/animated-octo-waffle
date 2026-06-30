import { ObjectId, type Db } from 'mongodb';
import type {
  ApprovalRecord,
  CreateDecisionRecordRequest,
  DecisionRecord,
  DecisionRecordListResponse,
  DecisionRecordPageSize,
  NumbersFollowUpOrigin,
  NumbersSnapshot,
  NumbersFollowUpCandidate,
  DecisionRecordSourceFilter,
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
  page?: number;
  pageSize?: DecisionRecordPageSize;
  source?: DecisionRecordSourceFilter;
  sourceBriefId?: string;
  status?: DecisionStatus;
}

export function buildDecisionRecordPagination(
  totalItems: number,
  requestedPage = 1,
  pageSize: DecisionRecordPageSize = 5
): DecisionRecordListResponse['pagination'] {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  return {
    endIndex,
    page,
    pageSize,
    startIndex,
    totalItems,
    totalPages
  };
}

export function buildDecisionRecordListQuery(corporationId: string, filters: ListDecisionFilters): Record<string, unknown> {
  const query: Record<string, unknown> = { corporationId };
  const clauses: Record<string, unknown>[] = [];

  if (filters.sourceBriefId) {
    clauses.push({ $or: [{ sourceBriefId: filters.sourceBriefId }, { researchBriefId: filters.sourceBriefId }] });
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.source === 'numbers') {
    query['sourceContext.sourceType'] = 'numbers_follow_up';
  }

  if (filters.source === 'people') {
    query['sourceContext.sourceType'] = 'people_follow_up';
  }

  if (filters.source === 'opportunity') {
    clauses.push({
      $or: [
        { sourceContext: { $exists: false } },
        { 'sourceContext.sourceType': { $exists: false } },
        { 'sourceContext.sourceType': 'research_brief' }
      ]
    });
  }

  if (clauses.length > 0) {
    query.$and = clauses;
  }

  return query;
}

export async function listDecisionRecords(
  db: Db,
  corporationId: string,
  filters: ListDecisionFilters
): Promise<DecisionRecordListResponse> {
  const query = buildDecisionRecordListQuery(corporationId, filters);
  const totalItems = await db.collection(collectionName).countDocuments(query);
  const pagination = buildDecisionRecordPagination(totalItems, filters.page, filters.pageSize);
  const documents = await db
    .collection(collectionName)
    .find(query)
    .sort({ updatedAt: -1, timestamp: -1 })
    .skip(pagination.startIndex === 0 ? 0 : pagination.startIndex - 1)
    .limit(pagination.pageSize)
    .toArray();

  return {
    decisions: documents.map((document) => normalizeDecisionRecordDocument(document as DecisionDocument)),
    pagination
  };
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
