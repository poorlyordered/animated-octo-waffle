import { z } from 'zod';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';
import { workerHandoffSummarySchema } from './worker-handoff.schema.js';

export const queueStatusSchema = z.enum(['queued', 'blocked', 'running', 'failed', 'completed', 'canceled']);

export const queueProvenanceSchema = z.object({
  decisionId: z.string().min(1),
  decisionStatus: z.literal('approved'),
  decisionApprovedAt: z.string().datetime().optional(),
  sourceBriefId: z.string().min(1).optional(),
  sourceRecommendation: z.string().min(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  sourceReferences: z.array(sourceReferenceSchema),
  coverage: operatingLegCoverageSchema.optional(),
  createdAt: z.string().datetime()
});

export const approvalSnapshotSchema = z.object({
  approvedAt: z.string().datetime(),
  approvedBy: z.string().optional(),
  approvalText: z.string().optional()
});

export const queueFailureSchema = z.object({
  message: z.string().min(1),
  code: z.string().optional(),
  failedAt: z.string().datetime()
});

export const queueOutputSchema = z.object({
  summary: z.string().min(1),
  completedAt: z.string().datetime().optional(),
  artifactRefs: z.array(z.string()).optional()
});

export const queueRetrySchema = z.object({
  eligible: z.boolean(),
  notBefore: z.string().datetime().optional()
});

export const automationQueueItemSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  sourceDecisionId: z.string().min(1),
  taskIntent: z.string().min(1),
  inputSummary: z.string().min(1),
  expectedOutput: z.string().min(1),
  status: queueStatusSchema,
  requestedBy: z.string().optional(),
  owner: z.string().optional(),
  isPlayerImpacting: z.boolean(),
  approval: approvalSnapshotSchema.nullable(),
  provenance: queueProvenanceSchema,
  attempts: z.number().int().nonnegative(),
  lastAttemptedAt: z.string().datetime().optional(),
  failure: queueFailureSchema.optional(),
  output: queueOutputSchema.optional(),
  retry: queueRetrySchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createAutomationQueueItemRequestSchema = z.object({
  sourceDecisionId: z.string().min(1),
  taskIntent: z.string().min(1),
  inputSummary: z.string().min(1),
  expectedOutput: z.string().min(1),
  owner: z.string().optional()
});

export const automationQueueListResponseSchema = z.object({
  queueItems: z.array(automationQueueItemSchema)
});

export const automationQueueItemResponseSchema = z.object({
  queueItem: automationQueueItemSchema,
  handoff: workerHandoffSummarySchema.optional()
});
