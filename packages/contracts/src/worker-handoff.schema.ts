import { z } from 'zod';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';
import { retryRequestSummarySchema } from './retry.schema.js';

export const workerHandoffStatusSchema = z.enum(['ready', 'claimed', 'completed', 'blocked', 'failed', 'cancelled']);
export const activeWorkerHandoffStatusSchema = z.enum(['ready', 'claimed', 'blocked']);

export const handoffPayloadSummarySchema = z.object({
  taskIntent: z.string().min(1),
  inputSummary: z.string().min(1),
  expectedOutput: z.string().min(1),
  sourceDecisionId: z.string().min(1),
  sourceBriefId: z.string().min(1).optional(),
  sourceReferences: z.array(sourceReferenceSchema),
  coverage: operatingLegCoverageSchema.optional()
});

export const handoffFailureSchema = z.object({
  message: z.string().min(1),
  code: z.string().optional(),
  failedAt: z.string().datetime(),
  workerId: z.string().min(1).optional()
});

export const workerProgressEventSchema = z.object({
  message: z.string().min(1).max(500),
  code: z.string().min(1).max(80).optional(),
  createdAt: z.string().datetime(),
  workerId: z.string().min(1).max(120)
});

export const workerCompletionResultSchema = z.object({
  summary: z.string().min(1).max(1000),
  artifactRefs: z.array(z.string().min(1).max(240)).default([]),
  completedAt: z.string().datetime(),
  workerId: z.string().min(1).max(120)
});

export const workerHandoffSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  queueItemId: z.string().min(1),
  sourceDecisionId: z.string().min(1),
  status: workerHandoffStatusSchema,
  payloadSummary: handoffPayloadSummarySchema,
  createdBy: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  progress: z.array(workerProgressEventSchema).default([]),
  result: workerCompletionResultSchema.optional(),
  failure: handoffFailureSchema.optional(),
  retry: retryRequestSummarySchema.optional()
});

export const workerHandoffSummarySchema = z.object({
  id: z.string().min(1),
  status: workerHandoffStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  progress: z.array(workerProgressEventSchema).default([]),
  result: workerCompletionResultSchema.optional(),
  failure: handoffFailureSchema.optional(),
  retry: retryRequestSummarySchema.optional()
});

export const prepareWorkerHandoffRequestSchema = z.object({
  note: z.string().optional()
});

export const workerHandoffResponseSchema = z.object({
  handoff: workerHandoffSchema
});

export const workerHandoffListResponseSchema = z.object({
  handoffs: z.array(workerHandoffSchema)
});

export const workerClaimRequestSchema = z.object({
  workerId: z.string().min(1).max(120)
});

export const workerProgressRequestSchema = z.object({
  workerId: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  code: z.string().min(1).max(80).optional()
}).strict();

export const workerCompleteRequestSchema = z.object({
  workerId: z.string().min(1).max(120),
  summary: z.string().min(1).max(1000),
  artifactRefs: z.array(z.string().min(1).max(240)).max(20).optional()
}).strict();

export const workerFailRequestSchema = z.object({
  workerId: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  code: z.string().min(1).max(80).optional()
}).strict();
