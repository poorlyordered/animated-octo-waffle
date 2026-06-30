import { z } from 'zod';
import { operatingLegCoverageSchema, sourceReferenceSchema } from './command-brief.schema.js';

export const decisionStatusSchema = z.enum(['proposed', 'approved', 'delegated', 'done', 'rejected']);
export const decisionRecordSourceFilterSchema = z.enum(['opportunity', 'numbers', 'people']);
export const decisionRecordPageSizeSchema = z.union([z.literal(3), z.literal(5), z.literal(10)]);

export const sourceProvenanceSnapshotSchema = z.object({
  briefId: z.string().min(1),
  briefCreatedAt: z.string().datetime(),
  focus: z.string().min(1),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceCount: z.number().int().nonnegative(),
  sourceReferences: z.array(sourceReferenceSchema),
  coverage: operatingLegCoverageSchema
});

export const decisionStatusHistoryEntrySchema = z.object({
  fromStatus: decisionStatusSchema.optional(),
  toStatus: decisionStatusSchema,
  changedAt: z.string().datetime(),
  changedBy: z.string().optional(),
  note: z.string().optional()
});

export const approvalRecordSchema = z.object({
  approvedAt: z.string().datetime(),
  approvedBy: z.string().optional(),
  approvalText: z.string().min(1)
});

export const decisionSourceContextSchema = z.object({
  sourceType: z.enum(['research_brief', 'numbers_follow_up', 'people_follow_up']),
  snapshotId: z.string().min(1).optional(),
  candidateId: z.string().min(1).optional(),
  followUpId: z.string().min(1).optional(),
  memberProfileId: z.string().min(1).optional(),
  relatedSection: z.string().min(1).optional(),
  suggestedPath: z.string().min(1).optional()
});

export const decisionRecordSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  sourceBriefId: z.string().min(1),
  sourceRecommendation: z.string().min(1),
  sourceProvenance: sourceProvenanceSnapshotSchema,
  sourceContext: decisionSourceContextSchema.optional(),
  status: decisionStatusSchema,
  rationale: z.string().min(1),
  expectedResult: z.string().min(1),
  isPlayerImpacting: z.boolean(),
  approval: approvalRecordSchema.nullable(),
  statusHistory: z.array(decisionStatusHistoryEntrySchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createDecisionRecordRequestSchema = z.object({
  sourceBriefId: z.string().min(1),
  sourceRecommendation: z.string().min(1),
  rationale: z.string().min(1),
  expectedResult: z.string().min(1),
  isPlayerImpacting: z.boolean()
});

export const updateDecisionStatusRequestSchema = z.object({
  status: decisionStatusSchema,
  note: z.string().optional(),
  approvalText: z.string().optional()
});

export const decisionRecordListResponseSchema = z.object({
  decisions: z.array(decisionRecordSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: decisionRecordPageSizeSchema,
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
    startIndex: z.number().int().nonnegative(),
    endIndex: z.number().int().nonnegative()
  })
});

export const decisionRecordResponseSchema = z.object({
  decision: decisionRecordSchema
});
