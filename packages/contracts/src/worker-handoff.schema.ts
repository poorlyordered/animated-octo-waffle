import { z } from 'zod';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';

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
  failedAt: z.string().datetime()
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
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  failure: handoffFailureSchema.optional()
});

export const workerHandoffSummarySchema = z.object({
  id: z.string().min(1),
  status: workerHandoffStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  failure: handoffFailureSchema.optional()
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
