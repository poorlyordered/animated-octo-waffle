import { z } from 'zod';
import { decisionRecordSchema } from './decision-record.schema.js';

export const commanderChatRoleSchema = z.enum(['user', 'assistant', 'system_notice']);
export const commanderChatSourceTypeSchema = z.enum([
  'command_brief',
  'intelligence_refresh_run',
  'numbers_snapshot',
  'opportunity',
  'people',
  'decision_record',
  'automation_queue',
  'operations_health',
  'production_evidence',
  'missing_data'
]);
export const commanderChatFreshnessSchema = z.enum(['current', 'stale', 'missing', 'unknown']);

export const commanderChatCitationSchema = z.object({
  sourceType: commanderChatSourceTypeSchema,
  sourceId: z.string().min(1).max(200).optional(),
  label: z.string().min(1).max(160),
  summary: z.string().min(1).max(1000),
  createdAt: z.string().datetime().optional(),
  freshness: commanderChatFreshnessSchema
});

export const commanderChatDraftDecisionSchema = z
  .object({
    id: z.string().min(1).max(120),
    title: z.string().min(1).max(160),
    rationale: z.string().min(1).max(1000),
    expectedResult: z.string().min(1).max(1000),
    sourceContext: z.string().min(1).max(1000),
    playerImpacting: z.boolean(),
    approvalRequired: z.boolean(),
    citationIds: z.array(z.string().min(1).max(200)).max(12),
    boundary: z.string().min(1).max(1000)
  })
  .strict();

export const commanderChatAssistantMetadataSchema = z
  .object({
    promptVersion: z.string().min(1).max(120),
    provider: z.string().min(1).max(80),
    model: z.string().min(1).max(160),
    citations: z.array(commanderChatCitationSchema).max(20),
    confidence: z.number().min(0).max(1).optional(),
    missingData: z.array(z.string().min(1).max(500)).max(20),
    draftDecision: commanderChatDraftDecisionSchema.optional(),
    boundary: z.string().min(1).max(1000),
    finishReason: z.string().min(1).max(80).optional(),
    warnings: z.array(z.string().min(1).max(500)).max(20)
  })
  .strict();

export const commanderChatMessageSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  corporationId: z.string().min(1),
  role: commanderChatRoleSchema,
  content: z.string().min(1).max(8000),
  createdAt: z.string().datetime(),
  metadata: commanderChatAssistantMetadataSchema.optional()
});

export const commanderChatSessionSchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  commander: z.string().min(1).max(200),
  title: z.string().min(1).max(160),
  status: z.enum(['active', 'archived']),
  messageCount: z.number().int().nonnegative(),
  lastMessageAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const commanderChatListResponseSchema = z.object({
  sessions: z.array(commanderChatSessionSchema),
  boundary: z.string().min(1)
});

export const commanderChatSessionResponseSchema = z.object({
  session: commanderChatSessionSchema,
  messages: z.array(commanderChatMessageSchema),
  boundary: z.string().min(1)
});

export const sendCommanderChatMessageRequestSchema = z
  .object({
    sessionId: z.string().min(1).max(200).optional(),
    message: z.string().min(1).max(4000)
  })
  .strict();

export const sendCommanderChatMessageResponseSchema = z.object({
  session: commanderChatSessionSchema,
  messages: z.array(commanderChatMessageSchema),
  assistantMessage: commanderChatMessageSchema,
  boundary: z.string().min(1)
});

export const createDecisionFromCommanderChatRequestSchema = z
  .object({
    messageId: z.string().min(1).max(200),
    draftDecisionId: z.string().min(1).max(120),
    commanderNote: z.string().min(1).max(500).optional()
  })
  .strict();

export const createDecisionFromCommanderChatResponseSchema = z.object({
  decision: decisionRecordSchema,
  duplicate: z.boolean(),
  boundary: z.string().min(1)
});
