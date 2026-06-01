import { describe, expect, it } from 'vitest';
import { normalizeCommandBriefDocument } from '../../../../netlify/functions/_shared/command-brief-normalizer';

describe('normalizeCommandBriefDocument', () => {
  it('normalizes nested OvernightDesk brief fields into the command brief contract', () => {
    const normalized = normalizeCommandBriefDocument({
      _id: { toString: () => 'brief-1' },
      corporationId: '917701062',
      focus: 'grykk-47-eve-official-news',
      createdAt: new Date('2026-05-31T11:47:03.120Z'),
      model: 'google/gemma-4-31b-it',
      promptVersion: 'official-news-brief-v1',
      sourceReferences: [{ title: 'Expansion patch notes', url: 'https://www.eveonline.com/news/view/example' }],
      brief: {
        confidence: 0.82,
        executiveSummary: 'Official news indicates near-term changes.',
        briefMarkdown: '## Brief',
        strategicImpacts: ['Expansion changes may shift priorities.'],
        recommendedActions: ['Review member readiness.'],
        watchlist: ['Patch notes follow-up'],
        memory: ['Track official expansion changes.']
      }
    });

    expect(normalized.id).toBe('brief-1');
    expect(normalized.sourceCount).toBe(1);
    expect(normalized.coverage.opportunity).toBe('present');
    expect(normalized.coverage.numbers).toBe('missing');
  });
});
