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

  it('normalizes Brain-generated command intelligence records', () => {
    const normalized = normalizeCommandBriefDocument({
      _id: { toString: () => 'brain-brief-1' },
      id: 'brain-brief-1',
      corporationId: '917701062',
      focus: 'gryyk-47-brain',
      createdAt: new Date('2026-07-01T12:00:00.000Z'),
      model: 'openai/gpt-5.2',
      promptVersion: 'brain-command-v1',
      sourceCount: 2,
      sourceReferences: [{ title: 'Numbers snapshot', sourceId: 'numbers-1' }],
      confidence: 0.77,
      executiveSummary: 'Brain summary',
      briefMarkdown: '## Brain',
      strategicImpacts: ['Numbers stable'],
      recommendedActions: ['Prepare draft order for review'],
      watchlist: ['Opportunity context'],
      memory: ['Missing data: fresh people ingestion'],
      coverage: {
        numbers: 'present',
        opportunity: 'stale',
        people: 'present',
        missingReasons: ['Opportunity context stale']
      }
    });

    expect(normalized.id).toBe('brain-brief-1');
    expect(normalized.focus).toBe('gryyk-47-brain');
    expect(normalized.model).toBe('openai/gpt-5.2');
    expect(normalized.coverage.people).toBe('present');
  });
});
