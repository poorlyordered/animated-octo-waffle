export const commanderChatRoles = ['user', 'assistant', 'system_notice'] as const;
export type CommanderChatRole = (typeof commanderChatRoles)[number];

export const commanderChatSourceTypes = [
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
] as const;
export type CommanderChatSourceType = (typeof commanderChatSourceTypes)[number];

export const commanderChatFreshnessStates = ['current', 'stale', 'missing', 'unknown'] as const;
export type CommanderChatFreshness = (typeof commanderChatFreshnessStates)[number];

export interface CommanderChatCitation {
  sourceType: CommanderChatSourceType;
  sourceId?: string;
  label: string;
  summary: string;
  createdAt?: string;
  freshness: CommanderChatFreshness;
}

export interface CommanderChatDraftDecision {
  id: string;
  title: string;
  rationale: string;
  expectedResult: string;
  sourceContext: string;
  playerImpacting: boolean;
  approvalRequired: boolean;
  citationIds: string[];
  boundary: string;
}

export interface CommanderChatAssistantMetadata {
  promptVersion: string;
  provider: string;
  model: string;
  citations: CommanderChatCitation[];
  confidence?: number;
  missingData: string[];
  draftDecision?: CommanderChatDraftDecision;
  boundary: string;
  finishReason?: string;
  warnings: string[];
}

export interface CommanderChatMessage {
  id: string;
  sessionId: string;
  corporationId: string;
  role: CommanderChatRole;
  content: string;
  createdAt: string;
  metadata?: CommanderChatAssistantMetadata;
}

export interface CommanderChatSession {
  id: string;
  corporationId: string;
  commander: string;
  title: string;
  status: 'active' | 'archived';
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommanderChatListResponse {
  sessions: CommanderChatSession[];
  boundary: string;
}

export interface CommanderChatSessionResponse {
  session: CommanderChatSession;
  messages: CommanderChatMessage[];
  boundary: string;
}

export interface SendCommanderChatMessageRequest {
  sessionId?: string;
  message: string;
}

export interface SendCommanderChatMessageResponse {
  session: CommanderChatSession;
  messages: CommanderChatMessage[];
  assistantMessage: CommanderChatMessage;
  boundary: string;
}

export interface CreateDecisionFromCommanderChatRequest {
  messageId: string;
  draftDecisionId: string;
  commanderNote?: string;
}

export interface CreateDecisionFromCommanderChatResponse {
  decision: import('./decision-record.js').DecisionRecord;
  duplicate: boolean;
  boundary: string;
}
