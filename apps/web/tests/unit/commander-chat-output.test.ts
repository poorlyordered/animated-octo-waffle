import {
  assertNoUnsafeCommanderChatMaterial,
  buildCommanderChatMetadata,
  parseCommanderChatModelOutput
} from '../../../../netlify/functions/_shared/commander-chat-output';

describe('commander chat output rules', () => {
  it('parses cited structured output with a draft decision', () => {
    const parsed = parseCommanderChatModelOutput(
      JSON.stringify({
        answer: 'The latest refresh completed and created a reviewable opportunity.',
        citations: [
          {
            sourceType: 'intelligence_refresh_run',
            sourceId: 'refresh-1',
            label: 'Latest refresh',
            summary: 'Completed with warnings.',
            freshness: 'current'
          }
        ],
        confidence: 0.72,
        missingData: [],
        warnings: [],
        draftDecision: {
          title: 'Review latest opportunity',
          rationale: 'The refresh surfaced a timely action.',
          expectedResult: 'Commander decides whether to approve planning.',
          sourceContext: 'Latest refresh',
          playerImpacting: true,
          approvalRequired: true,
          citationIds: ['refresh-1']
        }
      })
    );

    expect(parsed.citations[0].sourceType).toBe('intelligence_refresh_run');
    expect(parsed.draftDecision?.approvalRequired).toBe(true);
  });

  it('adds explicit missing data when uncited text is returned', () => {
    const parsed = parseCommanderChatModelOutput('No source available.');
    expect(parsed.missingData).toContain('No command source citation was available.');
  });

  it('rejects unsafe request and assistant material', () => {
    expect(() => assertNoUnsafeCommanderChatMaterial({ accessToken: 'abc' })).toThrow('not allowed');
    expect(() => parseCommanderChatModelOutput(JSON.stringify({ answer: 'Bearer eyJhbGciOiJIUzI1NiJ9' }))).toThrow(
      'unsafe value material'
    );
  });

  it('builds browser-safe metadata with separate prompt version', () => {
    const metadata = buildCommanderChatMetadata({
      parsed: {
        answer: 'Review the latest refresh.',
        citations: [
          {
            sourceType: 'command_brief',
            sourceId: 'brief-1',
            label: 'Command brief',
            summary: 'Stable posture.',
            freshness: 'current'
          }
        ],
        missingData: [],
        warnings: []
      },
      promptVersion: 'commander-chat/v1',
      provider: 'openrouter',
      model: 'openai/gpt-5.2',
      finishReason: 'stop'
    });

    expect(metadata.promptVersion).toBe('commander-chat/v1');
    expect(metadata.boundary).toContain('advisory only');
  });
});
