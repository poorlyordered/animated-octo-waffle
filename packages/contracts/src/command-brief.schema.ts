import { z } from 'zod';

export const sourceReferenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  sourceId: z.string().optional()
});

export const operatingLegCoverageSchema = z.object({
  numbers: z.enum(['present', 'missing', 'stale']),
  opportunity: z.enum(['present', 'missing', 'stale']),
  people: z.enum(['present', 'missing', 'stale']),
  missingReasons: z.array(z.string())
});

export const commandBriefSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  focus: z.string().min(1),
  createdAt: z.string().datetime(),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  sourceCount: z.number().int().nonnegative(),
  sourceReferences: z.array(sourceReferenceSchema),
  confidence: z.number().min(0).max(1),
  executiveSummary: z.string(),
  briefMarkdown: z.string(),
  strategicImpacts: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  watchlist: z.array(z.string()),
  memory: z.array(z.string()),
  coverage: operatingLegCoverageSchema
});

export const researchRequestSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  focus: z.string().min(1),
  status: z.enum(['queued', 'raw_captured', 'processing', 'processed', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  requestedBy: z.string().optional(),
  errorMessage: z.string().nullable().optional()
});

export const commandBriefResponseSchema = z.object({
  brief: commandBriefSchema.nullable()
});

export const researchStatusResponseSchema = z.object({
  request: researchRequestSchema.nullable()
});
