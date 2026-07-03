import { z } from 'zod';
import { commandBriefSchema, operatingLegCoverageSchema, researchRequestSchema, sourceReferenceSchema } from './command-brief.schema.js';

export const brainProviderSchema = z.enum(['openrouter']);

export const brainWorkerRunRequestSchema = z.object({
  corporationId: z.string().min(1).max(100),
  focus: z.string().min(1).max(200).optional(),
  workerId: z.string().min(1).max(200),
  reason: z.string().min(1).max(500).optional(),
  refreshRunId: z.string().min(1).max(200).optional()
});

export const brainRunSummarySchema = researchRequestSchema.extend({
  provider: brainProviderSchema,
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  refreshRunId: z.string().min(1).optional(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional()
});

export const brainDraftOrderSchema = z
  .object({
    title: z.string().min(1).max(200),
    rationale: z.string().min(1).max(1000),
    approvalRequired: z.literal(true)
  })
  .strict();

const boundedTextArray = z.array(z.string().min(1).max(1000)).max(12);

export const brainModelOutputSchema = z
  .object({
    executiveSummary: z.string().min(1).max(3000),
    briefMarkdown: z.string().min(1).max(12000),
    strategicImpacts: boundedTextArray,
    recommendedActions: boundedTextArray,
    watchlist: boundedTextArray,
    memory: boundedTextArray,
    missingData: z.array(z.string().min(1).max(500)).max(12),
    confidence: z.number().min(0).max(1),
    coverage: operatingLegCoverageSchema,
    draftOrders: z.array(brainDraftOrderSchema).max(10),
    sourceReferences: z.array(sourceReferenceSchema).max(20)
  })
  .strict();

export const brainWorkerRunResponseSchema = z.object({
  run: brainRunSummarySchema,
  brief: commandBriefSchema.pick({ id: true, focus: true, model: true, promptVersion: true }).optional(),
  message: z.string().min(1)
});
