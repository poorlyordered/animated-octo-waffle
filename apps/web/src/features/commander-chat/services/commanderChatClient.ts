import {
  commanderChatListResponseSchema,
  commanderChatSessionResponseSchema,
  createDecisionFromCommanderChatRequestSchema,
  createDecisionFromCommanderChatResponseSchema,
  sendCommanderChatMessageRequestSchema,
  sendCommanderChatMessageResponseSchema,
  type CommanderChatListResponse,
  type CommanderChatSessionResponse,
  type CreateDecisionFromCommanderChatRequest,
  type CreateDecisionFromCommanderChatResponse,
  type SendCommanderChatMessageRequest,
  type SendCommanderChatMessageResponse
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? String(body.error) : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return schema.parse(body);
}

export async function listCommanderChats(): Promise<CommanderChatListResponse> {
  const response = await fetch('/api/commander-chat');
  return parseJson(response, commanderChatListResponseSchema);
}

export async function getCommanderChat(sessionId: string): Promise<CommanderChatSessionResponse> {
  const response = await fetch(`/api/commander-chat/${encodeURIComponent(sessionId)}`);
  return parseJson(response, commanderChatSessionResponseSchema);
}

export async function sendCommanderChatMessage(
  request: SendCommanderChatMessageRequest
): Promise<SendCommanderChatMessageResponse> {
  const response = await fetch('/api/commander-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sendCommanderChatMessageRequestSchema.parse(request))
  });
  return parseJson(response, sendCommanderChatMessageResponseSchema);
}

export async function createDecisionFromCommanderChat(
  sessionId: string,
  request: CreateDecisionFromCommanderChatRequest
): Promise<CreateDecisionFromCommanderChatResponse> {
  const response = await fetch(`/api/commander-chat/${encodeURIComponent(sessionId)}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createDecisionFromCommanderChatRequestSchema.parse(request))
  });
  return parseJson(response, createDecisionFromCommanderChatResponseSchema);
}
