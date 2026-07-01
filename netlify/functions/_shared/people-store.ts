import { ObjectId, type Db } from 'mongodb';
import type {
  AutomationQueueItem,
  DecisionRecord,
  CreateLeadershipFollowUpRequest,
  CreatePeopleFollowUpDecisionRequest,
  CreatePeopleFollowUpQueueRequest,
  FollowUpPriority,
  FollowUpStatus,
  LeadershipFollowUp,
  MemberProfile,
  PeopleFollowUpHandoff,
  PeopleIngestionProvenance,
  UpdatePeopleFollowUpDecisionStatusRequest
} from '../../../packages/contracts/src/index';
import {
  createAutomationQueueItem,
  findAutomationQueueItem,
  findAutomationQueueItemByDecisionAndIntent,
  listAutomationQueueItems
} from './automation-queue-store';
import { findDecisionRecord, updateDecisionStatus } from './decision-record-store';
import { normalizeDecisionRecordDocument, type DecisionDocument } from './decision-record-normalizer';
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
import {
  assertFollowUpApprovalBoundary,
  assertNoDuplicateFollowUp,
  assertPeopleDecisionOrigin,
  isPeopleDecisionOrigin,
  needsFollowUp,
  peopleFollowUpHandoff
} from './people-rules';

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

export async function findLeadershipFollowUp(db: Db, corporationId: string, id: string): Promise<LeadershipFollowUp | null> {
  const document = await db.collection(followUpCollectionName).findOne(idFilter(id, corporationId));
  return document ? normalizeLeadershipFollowUpDocument(document as LeadershipFollowUpDocument) : null;
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

export async function buildPeopleFollowUpHandoffs(
  db: Db,
  corporationId: string,
  followUps: LeadershipFollowUp[]
): Promise<Record<string, PeopleFollowUpHandoff>> {
  const entries = await Promise.all(
    followUps.map(async (followUp) => {
      const decision = await linkedDecisionForFollowUp(db, corporationId, followUp);
      let queueItem: AutomationQueueItem | null = null;

      if (isPeopleDecisionOrigin(followUp, decision)) {
        if (followUp.sourceQueueItemId) {
          const linkedQueueItem = await findAutomationQueueItem(db, corporationId, followUp.sourceQueueItemId);
          if (linkedQueueItem?.sourceDecisionId === decision.id) {
            queueItem = linkedQueueItem;
          }
        }

        if (!queueItem) {
          queueItem = (await listAutomationQueueItems(db, corporationId, { sourceDecisionId: decision.id }))[0] ?? null;
        }
      }

      return [followUp.id, peopleFollowUpHandoff(followUp, { decision, queueItem })] as const;
    })
  );

  return Object.fromEntries(entries);
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

async function updateFollowUpLinks(
  db: Db,
  corporationId: string,
  followUp: LeadershipFollowUp,
  links: {
    decision?: DecisionRecord;
    queueItem?: AutomationQueueItem;
  }
): Promise<LeadershipFollowUp> {
  const now = new Date().toISOString();
  const sourceContext = {
    ...followUp.sourceContext,
    decisionId: links.decision?.id ?? followUp.sourceContext.decisionId,
    decisionStatus: links.decision?.status ?? followUp.sourceContext.decisionStatus,
    queueItemId: links.queueItem?.id ?? followUp.sourceContext.queueItemId,
    queueStatus: links.queueItem?.status ?? followUp.sourceContext.queueStatus
  };

  const set: Record<string, unknown> = {
    sourceContext,
    updatedAt: now
  };

  if (links.decision) {
    set.sourceDecisionId = links.decision.id;
  }

  if (links.queueItem) {
    set.sourceQueueItemId = links.queueItem.id;
  }

  await db.collection(followUpCollectionName).updateOne(idFilter(followUp.id, corporationId), { $set: set });

  const updated = await findLeadershipFollowUp(db, corporationId, followUp.id);
  if (!updated) {
    throw new Error('Leadership follow-up not found');
  }

  return updated;
}

async function linkedDecisionForFollowUp(
  db: Db,
  corporationId: string,
  followUp: LeadershipFollowUp
): Promise<DecisionRecord | null> {
  if (followUp.sourceDecisionId) {
    const linked = await findDecisionRecord(db, corporationId, followUp.sourceDecisionId);
    if (linked) {
      return linked;
    }
  }

  const document = await db.collection('strategic_decisions').findOne({
    corporationId,
    'sourceContext.sourceType': 'people_follow_up',
    'sourceContext.followUpId': followUp.id,
    'sourceContext.memberProfileId': followUp.memberProfileId
  });

  return document ? normalizeDecisionRecordDocument(document as DecisionDocument) : null;
}

export async function createDecisionRecordFromPeopleFollowUp(
  db: Db,
  corporationId: string,
  followUpId: string,
  request: CreatePeopleFollowUpDecisionRequest
): Promise<{ followUp: LeadershipFollowUp; decision: DecisionRecord; duplicate: boolean }> {
  const followUp = await findLeadershipFollowUp(db, corporationId, followUpId);

  if (!followUp) {
    throw new Error('Leadership follow-up not found');
  }

  const existingDecision = await linkedDecisionForFollowUp(db, corporationId, followUp);
  if (existingDecision) {
    return {
      followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision: existingDecision }),
      decision: existingDecision,
      duplicate: true
    };
  }

  const now = new Date().toISOString();
  const document = {
    corporationId,
    sourceBriefId: followUp.id,
    researchBriefId: followUp.id,
    sourceRecommendation: followUp.reason,
    sourceContext: {
      sourceType: 'people_follow_up',
      followUpId: followUp.id,
      memberProfileId: followUp.memberProfileId,
      relatedSection: 'leadership_followups',
      suggestedPath: 'queue'
    },
    sourceProvenance: {
      briefId: followUp.id,
      briefCreatedAt: followUp.createdAt,
      focus: 'people',
      model: 'processed-people-profile',
      promptVersion: 'people-followup-v1',
      confidence: 0,
      sourceCount: followUp.sourceContext.coverage.missingReasons.length === 0 ? 1 : 0,
      sourceReferences: [],
      coverage: {
        numbers: 'missing',
        opportunity: 'missing',
        people: 'present',
        missingReasons: followUp.sourceContext.coverage.missingReasons
      }
    },
    status: 'proposed',
    rationale: request.rationale?.trim() || followUp.reason,
    expectedResult:
      request.expectedResult?.trim() ||
      `Commander decision recorded from People follow-up for ${followUp.memberDisplayName}. No execution has been performed.`,
    isPlayerImpacting: followUp.isPlayerImpacting,
    approval: null,
    statusHistory: [
      {
        toStatus: 'proposed',
        changedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection('strategic_decisions').insertOne(document);
  const decision = normalizeDecisionRecordDocument({ ...document, _id: result.insertedId } as DecisionDocument);
  return {
    followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision }),
    decision,
    duplicate: false
  };
}

export async function updatePeopleFollowUpDecisionStatus(
  db: Db,
  corporationId: string,
  followUpId: string,
  request: UpdatePeopleFollowUpDecisionStatusRequest
): Promise<{ followUp: LeadershipFollowUp; decision: DecisionRecord }> {
  const followUp = await findLeadershipFollowUp(db, corporationId, followUpId);

  if (!followUp) {
    throw new Error('Leadership follow-up not found');
  }

  const decision = await linkedDecisionForFollowUp(db, corporationId, followUp);

  if (!decision) {
    throw new Error('People follow-up decision not found');
  }

  assertPeopleDecisionOrigin(followUp, decision);

  const updatedDecision = await updateDecisionStatus(db, corporationId, decision.id, {
    status: request.status,
    approvalText: request.approvalText,
    note: request.status === 'rejected' ? request.rejectionReason : undefined
  });

  if (!updatedDecision) {
    throw new Error('People follow-up decision not found');
  }

  return {
    followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision: updatedDecision }),
    decision: updatedDecision
  };
}

export async function createQueueItemFromPeopleFollowUp(
  db: Db,
  corporationId: string,
  followUpId: string,
  request: CreatePeopleFollowUpQueueRequest
): Promise<{ followUp: LeadershipFollowUp; decision: DecisionRecord; queueItem: AutomationQueueItem; duplicate: boolean }> {
  const followUp = await findLeadershipFollowUp(db, corporationId, followUpId);

  if (!followUp) {
    throw new Error('Leadership follow-up not found');
  }

  const decision = await linkedDecisionForFollowUp(db, corporationId, followUp);

  if (!decision) {
    throw new Error('People follow-up decision not found');
  }

  assertPeopleDecisionOrigin(followUp, decision);

  if (followUp.sourceQueueItemId) {
    const linkedQueueItem = await findAutomationQueueItem(db, corporationId, followUp.sourceQueueItemId);

    if (linkedQueueItem && linkedQueueItem.sourceDecisionId === decision.id) {
      return {
        followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision, queueItem: linkedQueueItem }),
        decision,
        queueItem: linkedQueueItem,
        duplicate: true
      };
    }
  }

  const existingDecisionQueueItem = (await listAutomationQueueItems(db, corporationId, { sourceDecisionId: decision.id }))[0];
  if (existingDecisionQueueItem) {
    return {
      followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision, queueItem: existingDecisionQueueItem }),
      decision,
      queueItem: existingDecisionQueueItem,
      duplicate: true
    };
  }

  const existingQueueItem = await findAutomationQueueItemByDecisionAndIntent(db, corporationId, decision.id, request.title);
  if (existingQueueItem) {
    return {
      followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision, queueItem: existingQueueItem }),
      decision,
      queueItem: existingQueueItem,
      duplicate: true
    };
  }

  const queueItem = await createAutomationQueueItem(db, corporationId, {
    sourceDecisionId: decision.id,
    taskIntent: request.title,
    inputSummary: request.inputSummary,
    expectedOutput: request.expectedOutput,
    owner: request.owner
  });

  if (!queueItem) {
    throw new Error('People follow-up decision not found');
  }

  return {
    followUp: await updateFollowUpLinks(db, corporationId, followUp, { decision, queueItem }),
    decision,
    queueItem,
    duplicate: false
  };
}
