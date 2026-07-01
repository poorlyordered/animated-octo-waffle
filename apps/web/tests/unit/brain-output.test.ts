import { brainPromptVersion } from '@gryyk/contracts';
import { brainOutputToCommandBriefDocument, parseBrainModelOutput } from '../../../../netlify/functions/_shared/brain-output';

const validOutput = {
  executiveSummary: 'Corporation state is stable with a recruiting follow-up gap.',
  briefMarkdown: '## Command Brief\nHold current posture and review recruiting follow-ups.',
  strategicImpacts: ['Numbers are stable.', 'People follow-up needs command review.'],
  recommendedActions: ['Review leadership follow-up candidates.'],
  watchlist: ['Stale market context'],
  memory: ['Previous command brief emphasized logistics.'],
  missingData: ['Fresh opportunity ingestion'],
  confidence: 0.74,
  coverage: {
    numbers: 'present',
    opportunity: 'stale',
    people: 'present',
    missingReasons: ['Opportunity context is stale.']
  },
  draftOrders: [
    {
      title: 'Prepare recruiting review',
      rationale: 'People data indicates a follow-up opening.',
      approvalRequired: true
    }
  ],
  sourceReferences: [{ title: 'Numbers snapshot', sourceId: 'numbers-1' }]
};

describe('Brain model output', () => {
  it('parses valid structured model output', () => {
    const parsed = parseBrainModelOutput(JSON.stringify(validOutput));

    expect(parsed.confidence).toBe(0.74);
    expect(parsed.coverage.opportunity).toBe('stale');
    expect(parsed.draftOrders[0].approvalRequired).toBe(true);
  });

  it('rejects non-json model output before storage', () => {
    expect(() => parseBrainModelOutput('not json')).toThrow('Brain model output was not valid JSON');
  });

  it('rejects execution-like model output', () => {
    expect(() =>
      parseBrainModelOutput(
        JSON.stringify({
          ...validOutput,
          dispatchTarget: 'queue-now'
        })
      )
    ).toThrow('Brain model output contained unsafe execution fields');
  });

  it('allows safe prose that mentions security boundaries without unsafe fields', () => {
    const parsed = parseBrainModelOutput(
      JSON.stringify({
        ...validOutput,
        recommendedActions: ['Keep secrets server-side while reviewing the draft order.']
      })
    );

    expect(parsed.recommendedActions[0]).toContain('secrets server-side');
  });

  it('converts accepted output to a command brief document with approval boundaries', () => {
    const document = brainOutputToCommandBriefDocument({
      output: parseBrainModelOutput(JSON.stringify(validOutput)),
      corporationId: '98123456',
      model: 'openai/gpt-5.2',
      provider: 'openrouter',
      createdAt: new Date('2026-07-01T12:00:00.000Z')
    });

    expect(document.promptVersion).toBe(brainPromptVersion);
    expect(document.recommendedActions).toContain(
      'Draft order requiring commander approval: Prepare recruiting review - People data indicates a follow-up opening.'
    );
    expect(JSON.stringify(document)).not.toContain('dispatchTarget');
  });
});
