import { brainWorkerRunRequestSchema, brainWorkerRunResponseSchema } from '@gryyk/contracts';

describe('Brain worker API contract', () => {
  it('accepts trusted worker run requests', () => {
    expect(
      brainWorkerRunRequestSchema.parse({
        corporationId: '98123456',
        focus: 'gryyk-47-brain',
        workerId: 'brain-worker-1',
        reason: 'scheduled refresh'
      })
    ).toEqual({
      corporationId: '98123456',
      focus: 'gryyk-47-brain',
      workerId: 'brain-worker-1',
      reason: 'scheduled refresh'
    });
  });

  it('accepts safe worker run responses', () => {
    const parsed = brainWorkerRunResponseSchema.parse({
      run: {
        id: 'brain-run-1',
        corporationId: '98123456',
        focus: 'gryyk-47-brain',
        status: 'processed',
        provider: 'openrouter',
        model: 'openai/gpt-5.2',
        promptVersion: 'brain-command-v1',
        createdAt: '2026-07-01T12:00:00.000Z',
        updatedAt: '2026-07-01T12:00:10.000Z',
        completedAt: '2026-07-01T12:00:10.000Z'
      },
      brief: {
        id: 'brief-1',
        focus: 'gryyk-47-brain',
        model: 'openai/gpt-5.2',
        promptVersion: 'brain-command-v1'
      },
      message:
        'Brain run completed and stored as command intelligence. No EVE action, queue dispatch, worker dispatch, or external mutation was executed.'
    });

    expect(parsed.run.provider).toBe('openrouter');
    expect(JSON.stringify(parsed)).not.toContain('OPENROUTER_API_KEY');
    expect(JSON.stringify(parsed)).not.toContain('accessToken');
  });
});
