import { z } from 'zod';
import { automationQueueItemSchema } from './automation-queue.schema.js';
import { approvalSnapshotSchema } from './automation-queue.schema.js';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';
import { decisionRecordSchema } from './decision-record.schema.js';

export const peopleCoverageStateSchema = z.enum(['present', 'missing', 'stale']);
export const peopleIngestionStatusSchema = z.enum(['queued', 'claimed', 'completed', 'failed', 'cancelled']);
export const peopleIngestionModeSchema = z.enum(['latest_ingestion', 'historical_profiles', 'unavailable']);
export const peopleIngestionSectionKeySchema = z.enum(['identity', 'roles', 'activity', 'delegation']);
export const followUpPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const followUpStatusSchema = z.enum(['open', 'blocked', 'completed', 'canceled']);

export const memberRoleContextSchema = z.object({
  roles: z.array(z.string()),
  titles: z.array(z.string()),
  accessNotes: z.string(),
  isStale: z.boolean(),
  lastObservedAt: z.string().datetime().optional(),
  missingReasons: z.array(z.string())
});

export const memberActivitySummarySchema = z.object({
  lastActiveAt: z.string().datetime().optional(),
  activityLabel: z.string(),
  participationCount: z.number().int().nonnegative().optional(),
  staleAfterDays: z.number().int().positive().optional(),
  isStale: z.boolean(),
  missingReasons: z.array(z.string())
});

export const peopleDataCoverageSchema = z.object({
  identity: peopleCoverageStateSchema,
  roles: peopleCoverageStateSchema,
  activity: peopleCoverageStateSchema,
  delegation: peopleCoverageStateSchema,
  missingReasons: z.array(z.string())
});

export const followUpSummarySchema = z.object({
  open: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative()
});

export const peopleIngestionSectionStatusSchema = z.object({
  key: peopleIngestionSectionKeySchema,
  status: peopleCoverageStateSchema
});

export const peopleIngestionFailureSchema = z.object({
  reason: z.string().min(1),
  failedAt: z.string().datetime()
});

export const peopleIngestionHistoryItemSchema = z.object({
  id: z.string().min(1),
  status: peopleIngestionStatusSchema,
  requestedAt: z.string().datetime(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  failure: peopleIngestionFailureSchema.optional(),
  sectionStatuses: z.array(peopleIngestionSectionStatusSchema),
  boundary: z.string().min(1)
});

export const preparePeopleIngestionRequestSchema = z.object({
  reason: z.string().min(1).max(500).optional()
});

export const peopleIngestionWorkerClaimRequestSchema = z.object({
  workerId: z.string().min(1).max(200)
});

export const peopleIngestionWorkerCompleteRequestSchema = z.object({
  workerId: z.string().min(1).max(200),
  sourceCount: z.number().int().nonnegative(),
  sectionStatuses: z.array(peopleIngestionSectionStatusSchema).min(1)
});

export const peopleIngestionWorkerFailRequestSchema = z.object({
  workerId: z.string().min(1).max(200),
  reason: z.string().min(1).max(500)
});

export const peopleIngestionWorkerRequestSummarySchema = peopleIngestionHistoryItemSchema.extend({
  corporationId: z.string().min(1),
  requestedBy: z.string().min(1)
});

export const peopleIngestionProvenanceSchema = z.object({
  mode: peopleIngestionModeSchema,
  sourceCount: z.number().int().nonnegative(),
  profileCount: z.number().int().nonnegative(),
  sectionStatuses: z.array(peopleIngestionSectionStatusSchema),
  history: z.array(peopleIngestionHistoryItemSchema),
  message: z.string().min(1),
  boundary: z.string().min(1)
});

export const memberProfileSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  characterId: z.string().optional(),
  displayName: z.string().min(1),
  aliases: z.array(z.string()),
  profileSummary: z.string(),
  roleContext: memberRoleContextSchema,
  activitySummary: memberActivitySummarySchema,
  delegationNotes: z.string(),
  followUpSummary: followUpSummarySchema,
  coverage: peopleDataCoverageSchema,
  operatingLegCoverage: operatingLegCoverageSchema.optional(),
  sourceRefs: z.array(sourceReferenceSchema),
  lastObservedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const followUpSourceContextSchema = z.object({
  memberProfileId: z.string().min(1),
  memberDisplayName: z.string().min(1),
  profileUpdatedAt: z.string().datetime().optional(),
  decisionId: z.string().min(1).optional(),
  decisionStatus: z.string().optional(),
  queueItemId: z.string().min(1).optional(),
  queueStatus: z.string().optional(),
  missingLinkReasons: z.array(z.string()),
  coverage: peopleDataCoverageSchema,
  createdAt: z.string().datetime()
});

export const leadershipFollowUpSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  memberProfileId: z.string().min(1),
  memberDisplayName: z.string().min(1),
  reason: z.string().min(1),
  priority: followUpPrioritySchema,
  status: followUpStatusSchema,
  owner: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  sourceDecisionId: z.string().min(1).optional(),
  sourceQueueItemId: z.string().min(1).optional(),
  isPlayerImpacting: z.boolean(),
  approval: approvalSnapshotSchema.nullable(),
  sourceContext: followUpSourceContextSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const peopleFollowUpHandoffSchema = z.object({
  followUpId: z.string().min(1),
  memberProfileId: z.string().min(1),
  memberDisplayName: z.string().min(1),
  decisionId: z.string().min(1).optional(),
  decisionStatus: z.string().optional(),
  approvalRequired: z.boolean(),
  queueReady: z.boolean(),
  queueItemId: z.string().min(1).optional(),
  queueStatus: z.string().optional(),
  duplicate: z.boolean().optional(),
  message: z.string().min(1),
  boundary: z.string().min(1),
  missingLinkReasons: z.array(z.string())
});

export const createLeadershipFollowUpRequestSchema = z.object({
  memberProfileId: z.string().min(1),
  reason: z.string().min(1),
  priority: followUpPrioritySchema,
  owner: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  sourceDecisionId: z.string().min(1).optional(),
  sourceQueueItemId: z.string().min(1).optional(),
  isPlayerImpacting: z.boolean(),
  approvalText: z.string().optional()
});

export const createPeopleFollowUpDecisionRequestSchema = z.object({
  rationale: z.string().min(1).optional(),
  expectedResult: z.string().min(1).optional()
});

export const updatePeopleFollowUpDecisionStatusRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  approvalText: z.string().optional(),
  rejectionReason: z.string().optional()
});

export const createPeopleFollowUpQueueRequestSchema = z.object({
  title: z.string().min(1),
  inputSummary: z.string().min(1),
  expectedOutput: z.string().min(1),
  owner: z.string().optional()
});

export const memberProfileListResponseSchema = z.object({
  members: z.array(memberProfileSchema),
  ingestionProvenance: peopleIngestionProvenanceSchema.optional()
});

export const preparePeopleIngestionResponseSchema = z.object({
  request: peopleIngestionHistoryItemSchema,
  provenance: peopleIngestionProvenanceSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});

export const peopleIngestionWorkerListResponseSchema = z.object({
  requests: z.array(peopleIngestionWorkerRequestSummarySchema)
});

export const peopleIngestionWorkerResponseSchema = z.object({
  request: peopleIngestionWorkerRequestSummarySchema
});

export const memberProfileDetailResponseSchema = z.object({
  member: memberProfileSchema,
  followUps: z.array(leadershipFollowUpSchema)
});

export const leadershipFollowUpListResponseSchema = z.object({
  followUps: z.array(leadershipFollowUpSchema)
});

export const leadershipFollowUpResponseSchema = z.object({
  followUp: leadershipFollowUpSchema
});

export const peopleFollowUpDecisionResponseSchema = z.object({
  followUp: leadershipFollowUpSchema,
  decision: decisionRecordSchema,
  handoff: peopleFollowUpHandoffSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});

export const peopleFollowUpQueueResponseSchema = z.object({
  followUp: leadershipFollowUpSchema,
  queueItem: automationQueueItemSchema,
  handoff: peopleFollowUpHandoffSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});
