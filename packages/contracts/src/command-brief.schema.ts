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

export const opportunityIngestionModeSchema = z.enum(['latest_research', 'historical_brief', 'unavailable']);
export const opportunityIngestionSectionKeySchema = z.enum(['sources', 'impacts', 'recommendations', 'watchlist']);
export const opportunityIngestionSectionStatusSchema = z.object({
  key: opportunityIngestionSectionKeySchema,
  status: z.enum(['present', 'missing', 'stale'])
});

export const opportunityIngestionHistoryItemSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['queued', 'raw_captured', 'processing', 'processed', 'failed']),
  requestedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  requestedBy: z.string().min(1).optional(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  failure: z
    .object({
      reason: z.string().min(1),
      failedAt: z.string().datetime()
    })
    .optional(),
  sectionStatuses: z.array(opportunityIngestionSectionStatusSchema),
  boundary: z.string().min(1)
});

export const prepareOpportunityIngestionRequestSchema = z.object({
  reason: z.string().min(1).max(500).optional()
});

export const opportunityIngestionWorkerClaimRequestSchema = z.object({
  workerId: z.string().min(1).max(200)
});

export const opportunityIngestionWorkerCompleteRequestSchema = z.object({
  workerId: z.string().min(1).max(200),
  sourceCount: z.number().int().nonnegative(),
  sectionStatuses: z.array(opportunityIngestionSectionStatusSchema).min(1)
});

export const opportunityIngestionWorkerFailRequestSchema = z.object({
  workerId: z.string().min(1).max(200),
  reason: z.string().min(1).max(500)
});

export const opportunityIngestionWorkerRequestSummarySchema = opportunityIngestionHistoryItemSchema.extend({
  corporationId: z.string().min(1),
  focus: z.string().min(1)
});

export const opportunityIngestionProvenanceSchema = z.object({
  mode: opportunityIngestionModeSchema,
  focus: z.string().min(1),
  sourceCount: z.number().int().nonnegative(),
  briefCount: z.number().int().nonnegative(),
  sectionStatuses: z.array(opportunityIngestionSectionStatusSchema),
  history: z.array(opportunityIngestionHistoryItemSchema),
  message: z.string().min(1),
  boundary: z.string().min(1)
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
  brief: commandBriefSchema.nullable(),
  opportunityProvenance: opportunityIngestionProvenanceSchema.optional()
});

export const prepareOpportunityIngestionResponseSchema = z.object({
  request: opportunityIngestionHistoryItemSchema,
  provenance: opportunityIngestionProvenanceSchema,
  duplicate: z.boolean().optional(),
  message: z.string().min(1)
});

export const opportunityIngestionWorkerListResponseSchema = z.object({
  requests: z.array(opportunityIngestionWorkerRequestSummarySchema)
});

export const opportunityIngestionWorkerResponseSchema = z.object({
  request: opportunityIngestionWorkerRequestSummarySchema
});

export const researchStatusResponseSchema = z.object({
  request: researchRequestSchema.nullable()
});
