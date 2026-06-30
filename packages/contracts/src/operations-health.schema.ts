import { z } from 'zod';

export const operationsHealthStatusSchema = z.enum(['ready', 'degraded', 'blocked']);
export const operationsHealthWarningSeveritySchema = z.enum(['info', 'warning', 'critical']);
export const workerSecretStateSchema = z.enum(['configured', 'fallback', 'missing']);

export const operationsCommandApiKeySchema = z.enum([
  'command_brief',
  'numbers',
  'opportunity',
  'people',
  'decision_records',
  'automation_queue',
  'esi_sync'
]);

export const operationsIngestionKeySchema = z.enum(['numbers_esi_sync', 'people_ingestion', 'opportunity_ingestion']);

export const operationsWorkerClassSchema = z.enum([
  'worker_handoff',
  'retry_worker',
  'esi_sync',
  'people_ingestion',
  'opportunity_ingestion'
]);

export const commandApiHealthSummarySchema = z.object({
  key: operationsCommandApiKeySchema,
  label: z.string().min(1),
  status: operationsHealthStatusSchema,
  evidence: z.string().min(1),
  lastUpdatedAt: z.string().datetime().nullable()
});

export const ingestionHealthSummarySchema = z.object({
  key: operationsIngestionKeySchema,
  label: z.string().min(1),
  status: operationsHealthStatusSchema,
  queued: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  latestAt: z.string().datetime().nullable(),
  evidence: z.string().min(1)
});

export const retryPostureSummarySchema = z.object({
  scheduled: z.number().int().nonnegative(),
  claimed: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  canceled: z.number().int().nonnegative(),
  workerHandoffTargets: z.number().int().nonnegative(),
  esiSyncTargets: z.number().int().nonnegative(),
  evidence: z.string().min(1)
});

export const workerReadinessSummarySchema = z.object({
  workerClass: operationsWorkerClassSchema,
  label: z.string().min(1),
  secretState: workerSecretStateSchema,
  status: operationsHealthStatusSchema,
  evidence: z.string().min(1)
});

export const operationsHealthWarningSchema = z.object({
  key: z.string().min(1),
  severity: operationsHealthWarningSeveritySchema,
  message: z.string().min(1)
});

export const operationsHealthResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  corporationId: z.string().min(1),
  overallStatus: operationsHealthStatusSchema,
  commandApis: z.array(commandApiHealthSummarySchema),
  ingestion: z.array(ingestionHealthSummarySchema),
  retryPosture: retryPostureSummarySchema,
  workerReadiness: z.array(workerReadinessSummarySchema),
  warnings: z.array(operationsHealthWarningSchema),
  boundary: z.string().min(1)
});
