import { z } from 'zod';

export const retryTargetTypeSchema = z.enum(['worker_handoff', 'esi_sync_request']);
export const retryRequestStatusSchema = z.enum(['scheduled', 'claimed', 'completed', 'blocked', 'canceled']);

export const retryExecutionResultSchema = z.object({
  targetType: retryTargetTypeSchema,
  targetId: z.string().min(1),
  replacementTargetId: z.string().min(1),
  replacementTargetStatus: z.enum(['ready', 'queued']),
  workerId: z.string().min(1),
  summary: z.string().min(1),
  executedAt: z.string().datetime()
});

export const retryPolicySummarySchema = z.object({
  canSchedule: z.boolean(),
  canCancel: z.boolean(),
  activeScheduledLimit: z.number().int().positive(),
  cancelableStatuses: z.array(z.enum(['scheduled', 'blocked'])),
  boundary: z.string().min(1)
});

export const retryRequestSummarySchema = z.object({
  id: z.string().min(1),
  targetType: retryTargetTypeSchema,
  targetId: z.string().min(1),
  status: retryRequestStatusSchema,
  reason: z.string().min(1),
  notBefore: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  claimedBy: z.string().min(1).optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  blockedAt: z.string().datetime().optional(),
  blockedReason: z.string().min(1).optional(),
  canceledAt: z.string().datetime().optional(),
  canceledBy: z.string().min(1).optional(),
  cancelReason: z.string().min(1).optional(),
  result: retryExecutionResultSchema.optional(),
  policy: retryPolicySummarySchema,
  boundary: z.string().min(1)
});

export const scheduleRetryRequestSchema = z.object({
  reason: z.string().min(1).max(500),
  notBefore: z.string().datetime().optional()
}).strict();

export const cancelRetryRequestSchema = z.object({
  reason: z.string().min(1).max(500)
}).strict();

export const scheduleRetryResponseSchema = z.object({
  retry: retryRequestSummarySchema,
  duplicate: z.boolean()
});

export const cancelRetryResponseSchema = z.object({
  retry: retryRequestSummarySchema
});

export const retryWorkerRequestSchema = z.object({
  workerId: z.string().min(1).max(120)
}).strict();

export const retryWorkerReadyResponseSchema = z.object({
  retries: z.array(retryRequestSummarySchema)
});

export const retryWorkerResponseSchema = z.object({
  retry: retryRequestSummarySchema
});
