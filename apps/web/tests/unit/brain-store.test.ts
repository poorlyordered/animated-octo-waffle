import { ObjectId } from 'mongodb';
import { brainRunSummary } from '../../../../netlify/functions/_shared/brain-store';

describe('Brain store summaries', () => {
  it('normalizes lifecycle records without provider secrets', () => {
    const summary = brainRunSummary({
      _id: new ObjectId('64b64c070000000000000001'),
      corporationId: '98123456',
      focus: 'gryyk-47-brain',
      status: 'processed',
      provider: 'openrouter',
      model: 'openai/gpt-5.2',
      promptVersion: 'brain-command-v1',
      createdAt: new Date('2026-07-01T12:00:00.000Z'),
      updatedAt: new Date('2026-07-01T12:00:10.000Z')
    });

    expect(summary.id).toBe('64b64c070000000000000001');
    expect(summary.status).toBe('processed');
    expect(JSON.stringify(summary)).not.toContain('secret');
  });
});
