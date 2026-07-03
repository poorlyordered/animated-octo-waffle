import {
  commanderChatListResponseSchema,
  createDecisionFromCommanderChatRequestSchema,
  sendCommanderChatMessageRequestSchema,
  sendCommanderChatMessageResponseSchema
} from '@gryyk/contracts';

const assistantMetadata = {
  promptVersion: 'commander-chat/v1',
  provider: 'openrouter',
  model: 'openai/gpt-5.2',
  citations: [
    {
      sourceType: 'intelligence_refresh_run',
      sourceId: 'refresh-1',
      label: 'Latest refresh',
      summary: 'Numbers, Opportunity, and People completed.',
      createdAt: '2026-07-03T01:00:00.000Z',
      freshness: 'current'
    }
  ],
  confidence: 0.74,
  missingData: [],
  boundary: 'No execution.',
  warnings: []
};

describe('commander chat API contracts', () => {
  it('accepts safe send-message requests', () => {
    expect(
      sendCommanderChatMessageRequestSchema.parse({
        sessionId: 'chat-1',
        message: 'What changed after the latest refresh?'
      })
    ).toEqual({
      sessionId: 'chat-1',
      message: 'What changed after the latest refresh?'
    });
  });

  it('accepts durable session list responses', () => {
    const parsed = commanderChatListResponseSchema.parse({
      sessions: [
        {
          id: 'chat-1',
          corporationId: '98123456',
          commander: 'session:Commander',
          title: 'Latest refresh',
          status: 'active',
          messageCount: 2,
          lastMessageAt: '2026-07-03T01:05:00.000Z',
          createdAt: '2026-07-03T01:00:00.000Z',
          updatedAt: '2026-07-03T01:05:00.000Z'
        }
      ],
      boundary: 'No execution.'
    });

    expect(parsed.sessions[0].corporationId).toBe('98123456');
  });

  it('accepts cited assistant responses with prompt metadata', () => {
    const parsed = sendCommanderChatMessageResponseSchema.parse({
      session: {
        id: 'chat-1',
        corporationId: '98123456',
        commander: 'session:Commander',
        title: 'Latest refresh',
        status: 'active',
        messageCount: 2,
        lastMessageAt: '2026-07-03T01:05:00.000Z',
        createdAt: '2026-07-03T01:00:00.000Z',
        updatedAt: '2026-07-03T01:05:00.000Z'
      },
      messages: [
        {
          id: 'message-1',
          sessionId: 'chat-1',
          corporationId: '98123456',
          role: 'user',
          content: 'What changed?',
          createdAt: '2026-07-03T01:04:00.000Z'
        },
        {
          id: 'message-2',
          sessionId: 'chat-1',
          corporationId: '98123456',
          role: 'assistant',
          content: 'The refresh completed.',
          createdAt: '2026-07-03T01:05:00.000Z',
          metadata: assistantMetadata
        }
      ],
      assistantMessage: {
        id: 'message-2',
        sessionId: 'chat-1',
        corporationId: '98123456',
        role: 'assistant',
        content: 'The refresh completed.',
        createdAt: '2026-07-03T01:05:00.000Z',
        metadata: assistantMetadata
      },
      boundary: 'No execution.'
    });

    expect(parsed.assistantMessage.metadata?.promptVersion).toBe('commander-chat/v1');
    expect(JSON.stringify(parsed)).not.toContain('OPENROUTER_API_KEY');
  });

  it('accepts explicit draft decision creation requests', () => {
    expect(
      createDecisionFromCommanderChatRequestSchema.parse({
        messageId: 'message-2',
        draftDecisionId: 'draft-review',
        commanderNote: 'Review this first.'
      })
    ).toEqual({
      messageId: 'message-2',
      draftDecisionId: 'draft-review',
      commanderNote: 'Review this first.'
    });
  });
});
