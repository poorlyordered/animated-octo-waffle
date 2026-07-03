import { buildDeterministicCommanderChatResponse } from '../../../../netlify/functions/_shared/commander-chat-openrouter';

describe('commander chat AI SDK adapter fallback', () => {
  it('builds deterministic cited responses for tests', () => {
    const response = buildDeterministicCommanderChatResponse({
      env: { promptVersion: 'commander-chat/v1', model: 'openai/gpt-5.2' },
      message: 'Draft a decision from this.',
      context: {
        summary: 'Latest refresh completed.',
        citations: [
          {
            sourceType: 'intelligence_refresh_run',
            sourceId: 'refresh-1',
            label: 'Latest refresh',
            summary: 'Completed.',
            freshness: 'current'
          }
        ],
        history: []
      }
    });

    expect(response.metadata.provider).toBe('deterministic');
    expect(response.metadata.draftDecision?.approvalRequired).toBe(true);
    expect(response.metadata.citations[0].sourceId).toBe('refresh-1');
  });
});
