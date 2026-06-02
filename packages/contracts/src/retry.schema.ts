import { z } from 'zod';

export const retryTargetTypeSchema = z.enum(['worker_handoff', 'esi_sync_request']);
export const retryRequestStatusSchema = z.enum(['scheduled']);

export const retryRequestSummarySchema = z.object({
  id: z.string().min(1),
  targetType: retryTargetTypeSchema,
  targetId: z.string().min(1),
  status: retryRequestStatusSchema,
  reason: z.string().min(1),
  notBefore: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  boundary: z.string().min(1)
});

export const scheduleRetryRequestSchema = z.object({
  reason: z.string().min(1).max(500),
  notBefore: z.string().datetime().optional()
}).strict();

export const scheduleRetryResponseSchema = z.object({
  retry: retryRequestSummarySchema,
  duplicate: z.boolean()
});
