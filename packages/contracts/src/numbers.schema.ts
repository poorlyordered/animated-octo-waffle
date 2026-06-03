import { z } from 'zod';
import { automationQueueItemSchema } from './automation-queue.schema.js';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';
import { decisionRecordSchema, decisionStatusSchema } from './decision-record.schema.js';
import { esiSyncRequestStatusSchema, esiSyncSectionStatusSummarySchema } from './esi-sync.schema.js';

export const numbersSectionKeySchema = z.enum(['wallet', 'assets', 'logistics', 'market', 'activity']);
export const numbersSectionStatusSchema = z.enum(['healthy', 'watch', 'critical', 'stale', 'missing']);
export const numbersMetricTrendSchema = z.enum(['up', 'down', 'flat', 'unknown']);
export const numbersMetricSeveritySchema = z.enum(['info', 'watch', 'critical']);

export const numbersMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  trend: numbersMetricTrendSchema.optional(),
  severity: numbersMetricSeveritySchema.optional()
});

export const numbersSectionSchema = z.object({
  key: numbersSectionKeySchema,
  label: z.string().min(1),
  status: numbersSectionStatusSchema,
  summary: z.string().min(1),
  metrics: z.array(numbersMetricSchema),
  updatedAt: z.string().datetime().optional(),
  staleReason: z.string().optional(),
  missingReason: z.string().optional()
});

export const numbersFollowUpCandidateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  rationale: z.string().min(1),
  suggestedPath: z.enum(['decision', 'queue']),
  isPlayerImpacting: z.boolean(),
  relatedSection: numbersSectionKeySchema.optional()
});

export const numbersProvenanceSchema = z.object({
  sourceCount: z.number().int().nonnegative(),
  sourceReferences: z.array(sourceReferenceSchema),
  confidence: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  createdAt: z.string().datetime()
});

export const numbersSnapshotSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  focus: z.string().min(1),
  sections: z.array(numbersSectionSchema),
  observations: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  followUps: z.array(numbersFollowUpCandidateSchema),
  provenance: numbersProvenanceSchema,
  coverage: operatingLegCoverageSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const numbersLiveProvenanceSchema = z.object({
  mode: z.enum(['live_sync', 'historical_snapshot', 'unavailable']),
  syncRequestId: z.string().min(1).optional(),
  snapshotId: z.string().min(1).optional(),
  status: esiSyncRequestStatusSchema.optional(),
  requestedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  snapshotCreatedAt: z.string().datetime().optional(),
  sourceCount: z.number().int().nonnegative(),
  sectionStatuses: z.array(esiSyncSectionStatusSummarySchema),
  message: z.string().min(1),
  boundary: z.string().min(1)
});

export const numbersSnapshotResponseSchema = z.object({
  snapshot: numbersSnapshotSchema.nullable(),
  liveProvenance: numbersLiveProvenanceSchema.optional()
});

export const numbersFollowUpOriginSchema = z.object({
  sourceType: z.literal('numbers_follow_up'),
  snapshotId: z.string().min(1),
  candidateId: z.string().min(1),
  relatedSection: numbersSectionKeySchema.optional(),
  suggestedPath: z.enum(['decision', 'queue'])
});

export const numbersApprovalHandoffSchema = z.object({
  candidateId: z.string().min(1),
  snapshotId: z.string().min(1),
  decisionId: z.string().min(1).optional(),
  decisionStatus: decisionStatusSchema.optional(),
  approvalRequired: z.boolean(),
  queueReady: z.boolean(),
  queueItemId: z.string().min(1).optional(),
  queueStatus: z.enum(['queued', 'blocked', 'running', 'completed', 'failed', 'canceled']).optional(),
  duplicate: z.boolean().optional(),
  message: z.string().min(1),
  boundary: z.string().min(1)
});

export const createNumbersFollowUpDecisionRequestSchema = z.object({
  snapshotId: z.string().min(1),
  expectedResult: z.string().min(1).optional()
});

export const numbersFollowUpDecisionResponseSchema = z.object({
  decision: decisionRecordSchema,
  origin: numbersFollowUpOriginSchema,
  approvalHandoff: numbersApprovalHandoffSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});

export const createNumbersFollowUpQueueRequestSchema = z.object({
  snapshotId: z.string().min(1),
  sourceDecisionId: z.string().min(1),
  taskIntent: z.string().min(1),
  inputSummary: z.string().min(1),
  expectedOutput: z.string().min(1),
  owner: z.string().optional()
});

export const numbersFollowUpQueueResponseSchema = z.object({
  queueItem: automationQueueItemSchema,
  origin: numbersFollowUpOriginSchema,
  approvalHandoff: numbersApprovalHandoffSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});
