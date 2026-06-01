import { z } from 'zod';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';

export const numbersSectionKeySchema = z.enum(['wallet', 'assets', 'logistics', 'market', 'activity']);
export const numbersSectionStatusSchema = z.enum(['healthy', 'watch', 'critical', 'stale', 'missing']);
export const numbersMetricTrendSchema = z.enum(['up', 'down', 'flat', 'unknown']);
export const numbersMetricSeveritySchema = z.enum(['info', 'watch', 'critical']);

export const numbersMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  trend: numbersMetricTrendSchema.optional(),
  severity: numbersMetricSeveritySchema.optional()
});

export const numbersSectionSchema = z.object({
  key: numbersSectionKeySchema,
  label: z.string().min(1),
  status: numbersSectionStatusSchema,
  summary: z.string().min(1),
  metrics: z.array(numbersMetricSchema),
  updatedAt: z.string().datetime().optional(),
  staleReason: z.string().optional(),
  missingReason: z.string().optional()
});

export const numbersFollowUpCandidateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  rationale: z.string().min(1),
  suggestedPath: z.enum(['decision', 'queue']),
  isPlayerImpacting: z.boolean(),
  relatedSection: numbersSectionKeySchema.optional()
});

export const numbersProvenanceSchema = z.object({
  sourceCount: z.number().int().nonnegative(),
  sourceReferences: z.array(sourceReferenceSchema),
  confidence: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  createdAt: z.string().datetime()
});

export const numbersSnapshotSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  focus: z.string().min(1),
  sections: z.array(numbersSectionSchema),
  observations: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  followUps: z.array(numbersFollowUpCandidateSchema),
  provenance: numbersProvenanceSchema,
  coverage: operatingLegCoverageSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const numbersSnapshotResponseSchema = z.object({
  snapshot: numbersSnapshotSchema.nullable()
});
