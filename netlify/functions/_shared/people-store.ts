import { ObjectId, type Db } from 'mongodb';
import type {
  CreateLeadershipFollowUpRequest,
  FollowUpPriority,
  FollowUpStatus,
  LeadershipFollowUp,
  MemberProfile,
  PeopleIngestionProvenance
} from '../../../packages/contracts/src/index';
import { findAutomationQueueItem } from './automation-queue-store';
import { findDecisionRecord } from './decision-record-store';
import {
  aggregatePeopleIngestionSectionStatuses,
  buildPeopleIngestionProvenance,
  listPeopleIngestionHistory
} from './people-ingestion-history';
import {
  normalizeLeadershipFollowUpDocument,
  normalizeMemberProfileDocument,
  type LeadershipFollowUpDocument,
  type MemberProfileDocument
} from './people-normalizer';
import { assertFollowUpApprovalBoundary, assertNoDuplicateFollowUp, needsFollowUp } from './people-rules';

const memberCollectionName = 'member_profiles';
const followUpCollectionName = 'leadership_followups';

function idFilter(id: string, corporationId: string) {
  return ObjectId.isValid(id)
    ? { _id: new ObjectId(id), corporationId }
    : { id, corporationId };
}

export interface ListMemberProfileFilters {
  activity?: 'active' | 'stale' | 'missing';
  needsFollowUp?: boolean;
}

export interface ListLeadershipFollowUpFilters {
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  memberProfileId?: string;
}

function applyMemberFilters(members: MemberProfile[], filters: ListMemberProfileFilters): MemberProfile[] {
  return members.filter((member) => {
    if (filters.needsFollowUp !== undefined && needsFollowUp(member) !== filters.needsFollowUp) {
      return false;
    }

    if (filters.activity === 'active' && (member.activitySummary.isStale || !member.activitySummary.lastActiveAt)) {
      return false;
    }

    if (filters.activity === 'stale' && !member.activitySummary.isStale) {
      return false;
    }

    if (filters.activity === 'missing' && member.activitySummary.lastActiveAt) {
      return false;
    }

    return true;
  });
}

export async function listMemberProfiles(
  db: Db,
  corporationId: string,
  filters: ListMemberProfileFilters
): Promise<MemberProfile[]> {
  const documents = await db.collection(memberCollectionName).find({ corporationId }).sort({ displayName: 1, updatedAt: -1 }).toArray();
  return applyMemberFilters(
    documents.map((document) => normalizeMemberProfileDocument(document as MemberProfileDocument)),
    filters
  );
}

export async function findMemberProfile(db: Db, corporationId: string, id: string): Promise<MemberProfile | null> {
  const document = await db.collection(memberCollectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeMemberProfileDocument(document as MemberProfileDocument) : null;
}

export async function getPeopleIngestionProvenance(
  db: Db,
  corporationId: string,
  members: MemberProfile[]
): Promise<PeopleIngestionProvenance> {
  const fallbackSections = aggregatePeopleIngestionSectionStatuses(members);
  const history = await listPeopleIngestionHistory(db, corporationId, fallbackSections);
  return buildPeopleIngestionProvenance(members, history);
}

export async function listLeadershipFollowUps(
  db: Db,
  corporationId: string,
  filters: ListLeadershipFollowUpFilters
): Promise<LeadershipFollowUp[]> {
  const query: Record<string, unknown> = { corporationId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.memberProfileId) {
    query.memberProfileId = filters.memberProfileId;
  }

  const documents = await db.collection(followUpCollectionName).find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  return documents.map((document) => normalizeLeadershipFollowUpDocument(document as LeadershipFollowUpDocument));
}

export async function createLeadershipFollowUp(
  db: Db,
  corporationId: string,
  request: CreateLeadershipFollowUpRequest
): Promise<LeadershipFollowUp | null> {
  const member = await findMemberProfile(db, corporationId, request.memberProfileId);

  if (!member) {
    return null;
  }

  assertFollowUpApprovalBoundary(request);

  const reason = request.reason.trim();
  const duplicate = await db.collection(followUpCollectionName).findOne({
    corporationId,
    memberProfileId: member.id,
    reason
  });
  assertNoDuplicateFollowUp(Boolean(duplicate));

  const missingLinkReasons: string[] = [];
  const sourceDecision = request.sourceDecisionId
    ? await findDecisionRecord(db, corporationId, request.sourceDecisionId)
    : null;
  const sourceQueueItem = request.sourceQueueItemId
    ? await findAutomationQueueItem(db, corporationId, request.sourceQueueItemId)
    : null;

  if (request.sourceDecisionId && !sourceDecision) {
    missingLinkReasons.push(`Source decision ${request.sourceDecisionId} was not found.`);
  }

  if (request.sourceQueueItemId && !sourceQueueItem) {
    missingLinkReasons.push(`Source queue item ${request.sourceQueueItemId} was not found.`);
  }

  const now = new Date().toISOString();
  const approval = request.approvalText?.trim()
    ? {
        approvedAt: now,
        approvalText: request.approvalText.trim()
      }
    : null;
  const document = {
    corporationId,
    memberProfileId: member.id,
    memberDisplayName: member.displayName,
    reason,
    priority: request.priority,
    status: 'open' satisfies FollowUpStatus,
    owner: request.owner?.trim() || undefined,
    dueAt: request.dueAt,
    sourceDecisionId: request.sourceDecisionId,
    sourceQueueItemId: request.sourceQueueItemId,
    isPlayerImpacting: request.isPlayerImpacting,
    approval,
    sourceContext: {
      memberProfileId: member.id,
      memberDisplayName: member.displayName,
      profileUpdatedAt: member.updatedAt,
      decisionId: sourceDecision?.id ?? request.sourceDecisionId,
      decisionStatus: sourceDecision?.status,
      queueItemId: sourceQueueItem?.id ?? request.sourceQueueItemId,
      queueStatus: sourceQueueItem?.status,
      missingLinkReasons,
      coverage: member.coverage,
      createdAt: now
    },
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(followUpCollectionName).insertOne(document);
  return normalizeLeadershipFollowUpDocument({ ...document, _id: result.insertedId } as LeadershipFollowUpDocument);
}
