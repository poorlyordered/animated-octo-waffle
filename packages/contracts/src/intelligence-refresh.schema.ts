import { z } from 'zod';

export const intelligenceRefreshDomainSchema = z.enum(['numbers', 'opportunity', 'people']);
export const intelligenceRefreshRunStatusSchema = z.enum([
  'queued',
  'running',
  'waiting_for_evaluation',
  'evaluating',
  'completed',
  'completed_with_warnings',
  'failed',
  'cancelled'
]);
export const intelligenceRefreshStepStatusSchema = z.enum(['queued', 'prepared', 'running', 'completed', 'failed', 'blocked', 'skipped']);
export const intelligenceRefreshEvaluationStatusSchema = z.enum(['not_ready', 'ready', 'running', 'completed', 'failed']);

export const intelligenceRefreshPreparedRequestSchema = z.object({
  type: z.enum(['esi_sync_request', 'people_ingestion_request', 'opportunity_ingestion_request', 'brain_run']),
  id: z.string().min(1)
});

export const intelligenceRefreshSectionStatusSchema = z.object({
  key: z.string().min(1).max(100),
  status: z.string().min(1).max(100)
});

export const intelligenceRefreshFailureSummarySchema = z.object({
  reason: z.string().min(1).max(500),
  failedAt: z.string().datetime()
});

export const intelligenceRefreshStepResultSchema = z
  .object({
    sourceCount: z.number().int().nonnegative(),
    summary: z.string().min(1).max(1000),
    sectionStatuses: z.array(intelligenceRefreshSectionStatusSchema).max(25),
    linkedRequest: intelligenceRefreshPreparedRequestSchema.optional(),
    warnings: z.array(z.string().min(1).max(500)).max(12)
  })
  .strict();

export const intelligenceRefreshDomainStepSchema = z.object({
  id: z.string().min(1),
  domain: intelligenceRefreshDomainSchema,
  status: intelligenceRefreshStepStatusSchema,
  preparedRequest: intelligenceRefreshPreparedRequestSchema.optional(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  skippedAt: z.string().datetime().optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  freshness: z.string().min(1).max(500).optional(),
  sectionStatuses: z.array(intelligenceRefreshSectionStatusSchema),
  failure: intelligenceRefreshFailureSummarySchema.optional(),
  warnings: z.array(z.string().min(1).max(500))
});

export const intelligenceRefreshEvaluationSchema = z.object({
  status: intelligenceRefreshEvaluationStatusSchema,
  brainRunId: z.string().min(1).optional(),
  commandBriefId: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  promptVersion: z.string().min(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
  sourceSummary: z.array(z.string().min(1).max(1000)),
  createdAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  failure: z.string().min(1).max(500).optional()
});

export const intelligenceRefreshPolicySummarySchema = z.object({
  allowPartialEvaluation: z.boolean(),
  boundary: z.string().min(1)
});

export const intelligenceRefreshRunSummarySchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  requestedBy: z.string().min(1),
  requestedDomains: z.array(intelligenceRefreshDomainSchema).min(1),
  status: intelligenceRefreshRunStatusSchema,
  steps: z.array(intelligenceRefreshDomainStepSchema),
  evaluation: intelligenceRefreshEvaluationSchema,
  duplicateOf: z.string().min(1).optional(),
  policy: intelligenceRefreshPolicySummarySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  failure: intelligenceRefreshFailureSummarySchema.optional(),
  warnings: z.array(z.string().min(1).max(500)),
  boundary: z.string().min(1)
});

export const createIntelligenceRefreshRunRequestSchema = z
  .object({
    domains: z.array(intelligenceRefreshDomainSchema).min(1).max(3),
    reason: z.string().min(1).max(500).optional()
  })
  .strict();

export const intelligenceRefreshRunResponseSchema = z.object({
  run: intelligenceRefreshRunSummarySchema
});

export const createIntelligenceRefreshRunResponseSchema = intelligenceRefreshRunResponseSchema.extend({
  duplicate: z.boolean()
});

export const intelligenceRefreshRunListResponseSchema = z.object({
  runs: z.array(intelligenceRefreshRunSummarySchema)
});

export const intelligenceRefreshWorkerListResponseSchema = z.object({
  steps: z.array(
    z.object({
      runId: z.string().min(1),
      step: intelligenceRefreshDomainStepSchema
    })
  )
});

export const intelligenceRefreshWorkerClaimRequestSchema = z
  .object({
    workerId: z.string().min(1).max(200)
  })
  .strict();

export const intelligenceRefreshWorkerCompleteRequestSchema = z
  .object({
    workerId: z.string().min(1).max(200),
    result: intelligenceRefreshStepResultSchema
  })
  .strict();

export const intelligenceRefreshWorkerFailRequestSchema = z
  .object({
    workerId: z.string().min(1).max(200),
    reason: z.string().min(1).max(500)
  })
  .strict();

export const intelligenceRefreshWorkerEvaluateRequestSchema = z
  .object({
    workerId: z.string().min(1).max(200),
    allowPartial: z.boolean().optional(),
    reason: z.string().min(1).max(500).optional()
  })
  .strict();
