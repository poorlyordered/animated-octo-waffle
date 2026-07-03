import type {
  CommanderChatMessage,
  CommanderChatSession
} from '@gryyk/contracts';

export const commanderChatSessionFixture: CommanderChatSession = {
  id: 'chat-fixture-1',
  corporationId: '98123456',
  commander: 'session:Fixture Commander',
  title: 'Latest refresh',
  status: 'active',
  messageCount: 2,
  lastMessageAt: '2026-07-03T01:05:00.000Z',
  createdAt: '2026-07-03T01:00:00.000Z',
  updatedAt: '2026-07-03T01:05:00.000Z'
};

export const commanderChatAssistantMessageFixture: CommanderChatMessage = {
  id: 'chat-message-fixture-2',
  sessionId: commanderChatSessionFixture.id,
  corporationId: commanderChatSessionFixture.corporationId,
  role: 'assistant',
  content: 'The latest refresh completed and linked a command brief for commander review.',
  createdAt: '2026-07-03T01:05:00.000Z',
  metadata: {
    promptVersion: 'commander-chat/v1',
    provider: 'openrouter',
    model: 'openai/gpt-5.2',
    citations: [
      {
        sourceType: 'intelligence_refresh_run',
        sourceId: 'refresh-fixture-1',
        label: 'Latest refresh',
        summary: 'Refresh completed with Brain linkage.',
        freshness: 'current'
      }
    ],
    missingData: [],
    boundary: 'No execution.',
    warnings: [],
    draftDecision: {
      id: 'draft-review-refresh',
      title: 'Review refresh recommendation',
      rationale: 'The refresh produced a reviewable recommendation.',
      expectedResult: 'Commander records a proposed decision for review.',
      sourceContext: 'Latest refresh',
      playerImpacting: true,
      approvalRequired: true,
      citationIds: ['refresh-fixture-1'],
      boundary: 'No execution.'
    }
  }
};
