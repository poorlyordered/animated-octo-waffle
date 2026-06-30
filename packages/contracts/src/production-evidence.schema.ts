import { z } from 'zod';

export const productionEvidenceEnvironmentSchema = z.enum(['production', 'staging', 'controlled_staging']);
export const productionEvidenceDecisionSchema = z.enum(['go', 'no_go', 'controlled_staging']);
export const productionEvidenceCheckStatusSchema = z.enum(['verified', 'attention', 'blocked', 'not_applicable']);
export const productionEvidenceCheckKeySchema = z.enum([
  'validation',
  'netlify_environment',
  'eve_sso_provider',
  'mongodb',
  'monitoring',
  'worker_secrets',
  'smoke_test',
  'rollback'
]);

const safeEvidenceTextSchema = z.string().trim().min(1).max(180);

export const productionEvidenceCheckSchema = z.object({
  key: productionEvidenceCheckKeySchema,
  status: productionEvidenceCheckStatusSchema,
  evidence: safeEvidenceTextSchema
}).strict();

export const productionEvidenceRecordSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  environment: productionEvidenceEnvironmentSchema,
  decision: productionEvidenceDecisionSchema,
  commitSha: z.string().trim().regex(/^[a-f0-9]{7,40}$/i),
  pullRequestUrl: z.string().trim().url().nullable(),
  deployId: z.string().trim().min(1).max(120).nullable(),
  rollbackTarget: z.string().trim().min(1).max(120).nullable(),
  checks: z.array(productionEvidenceCheckSchema).min(1).max(8),
  recordedBy: z.string().min(1).max(120),
  recordedAt: z.string().datetime(),
  boundary: z.string().min(1)
});

export const createProductionEvidenceRequestSchema = z.object({
  environment: productionEvidenceEnvironmentSchema,
  decision: productionEvidenceDecisionSchema,
  commitSha: z.string().trim().regex(/^[a-f0-9]{7,40}$/i),
  pullRequestUrl: z.string().trim().url().nullable().optional(),
  deployId: z.string().trim().min(1).max(120).nullable().optional(),
  rollbackTarget: z.string().trim().min(1).max(120).nullable().optional(),
  checks: z.array(productionEvidenceCheckSchema).min(1).max(8)
}).strict();

export const productionEvidenceListResponseSchema = z.object({
  records: z.array(productionEvidenceRecordSchema),
  boundary: z.string().min(1)
});

export const productionEvidenceRecordResponseSchema = z.object({
  record: productionEvidenceRecordSchema
});
