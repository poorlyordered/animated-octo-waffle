import { commanderChatSessionSchema, type CommanderChatMessage } from '@gryyk/contracts';

describe('commander chat surface data', () => {
  it('keeps durable session rows bounded and renderable', () => {
    const session = commanderChatSessionSchema.parse({
      id: 'chat-1',
      corporationId: '98123456',
      commander: 'session:Commander',
      title: 'What changed after refresh?',
      status: 'active',
      messageCount: 2,
      lastMessageAt: '2026-07-03T01:05:00.000Z',
      createdAt: '2026-07-03T01:00:00.000Z',
      updatedAt: '2026-07-03T01:05:00.000Z'
    });

    expect(session.title).toContain('refresh');
  });

  it('identifies assistant messages with draft decisions', () => {
    const message: CommanderChatMessage = {
      id: 'message-2',
      sessionId: 'chat-1',
      corporationId: '98123456',
      role: 'assistant',
      content: 'Draft ready.',
      createdAt: '2026-07-03T01:05:00.000Z',
      metadata: {
        promptVersion: 'commander-chat/v1',
        provider: 'openrouter',
        model: 'openai/gpt-5.2',
        citations: [],
        missingData: ['No source citation was available.'],
        boundary: 'No execution.',
        warnings: [],
        draftDecision: {
          id: 'draft-review',
          title: 'Review',
          rationale: 'Review this.',
          expectedResult: 'Decision is proposed only.',
          sourceContext: 'Commander chat',
          playerImpacting: true,
          approvalRequired: true,
          citationIds: [],
          boundary: 'No execution.'
        }
      }
    };

    expect(message.metadata?.draftDecision?.id).toBe('draft-review');
  });
});
