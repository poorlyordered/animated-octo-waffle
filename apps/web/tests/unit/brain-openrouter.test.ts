import { jest } from '@jest/globals';
import { defaultBrainFocus } from '@gryyk/contracts';
import type { BrainPromptContext } from '../../../../netlify/functions/_shared/brain-context';
import { runOpenRouterBrain } from '../../../../netlify/functions/_shared/brain-openrouter';

const context: BrainPromptContext = {
  corporationId: '98123456',
  focus: defaultBrainFocus,
  generatedAt: '2026-07-01T12:00:00.000Z',
  numbers: { status: 'present' },
  opportunity: { status: 'missing' },
  people: { status: 'present' },
  decisions: { recent: [] },
  queue: { recent: [] },
  sourceReferences: []
};

const modelOutput = {
  executiveSummary: 'Stable command picture.',
  briefMarkdown: '## Brain\nStable command picture.',
  strategicImpacts: ['Numbers present.'],
  recommendedActions: ['Review missing opportunity context.'],
  watchlist: ['Opportunity data'],
  memory: ['No prior memory.'],
  missingData: ['Opportunity context'],
  confidence: 0.66,
  coverage: {
    numbers: 'present',
    opportunity: 'missing',
    people: 'present',
    missingReasons: ['No opportunity context.']
  },
  draftOrders: [],
  sourceReferences: []
};

describe('OpenRouter Brain adapter', () => {
  it('posts a strict structured-output chat completion request without exposing the key in the body', async () => {
    const fetchMock = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));

      expect(body.response_format.json_schema.strict).toBe(true);
      expect(body.provider.require_parameters).toBe(true);
      expect(JSON.stringify(body)).not.toContain('test-openrouter-key');

      return {
        ok: true,
        json: async () => ({
          model: 'openai/gpt-5.2',
          choices: [{ message: { content: JSON.stringify(modelOutput) } }]
        })
      } as Response;
    });

    const result = await runOpenRouterBrain(
      context,
      {
        OPENROUTER_API_KEY: 'test-openrouter-key',
        OPENROUTER_MODEL: 'openai/gpt-5.2'
      },
      fetchMock as typeof fetch
    );

    expect(result.provider).toBe('openrouter');
    expect(result.output.executiveSummary).toBe('Stable command picture.');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer test-openrouter-key'
        })
      })
    );
  });

  it('requires provider configuration before calling OpenRouter', async () => {
    await expect(runOpenRouterBrain(context, {}, jest.fn() as unknown as typeof fetch)).rejects.toThrow('OPENROUTER_API_KEY is required');
  });
});
