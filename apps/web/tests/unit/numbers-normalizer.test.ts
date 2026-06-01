import { normalizeNumbersDocument } from '../../../../netlify/functions/_shared/numbers-normalizer';

describe('numbers normalizer', () => {
  it('normalizes full processed numbers documents', () => {
    const normalized = normalizeNumbersDocument({
      _id: { toString: () => 'numbers-1' },
      corporationId: '917701062',
      focus: 'corporation',
      sections: {
        wallet: {
          status: 'healthy',
          summary: 'Wallet runway is stable.',
          metrics: [{ label: 'Liquid ISK', value: '12.4B', unit: 'ISK', trend: 'up' }],
          updatedAt: '2026-06-01T12:00:00.000Z'
        }
      },
      observations: ['Wallet runway is stable.'],
      risks: [],
      opportunities: [],
      followUps: [],
      provenance: { sourceCount: 1, sourceReferences: [], confidence: 1, createdAt: '2026-06-01T12:00:00.000Z' },
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z'
    });

    expect(normalized.sections.find((section) => section.key === 'wallet')?.status).toBe('healthy');
    expect(normalized.sections.find((section) => section.key === 'activity')?.status).toBe('missing');
  });

  it('marks missing and stale sections explicitly', () => {
    const normalized = normalizeNumbersDocument({
      corporationId: '917701062',
      sections: {
        market: {
          status: 'stale',
          summary: 'Market data needs refresh.',
          metrics: [],
          staleReason: 'Market data is too old.'
        }
      },
      provenance: { sourceCount: 0, sourceReferences: [], createdAt: '2026-06-01T12:00:00.000Z' },
      createdAt: '2026-06-01T12:00:00.000Z'
    });

    expect(normalized.sections.find((section) => section.key === 'market')?.staleReason).toBe('Market data is too old.');
    expect(normalized.sections.find((section) => section.key === 'wallet')?.missingReason).toContain('Wallet data');
  });

  it('filters invalid metric and follow-up entries', () => {
    const normalized = normalizeNumbersDocument({
      corporationId: '917701062',
      sections: {
        wallet: {
          status: 'healthy',
          summary: 'Wallet data exists.',
          metrics: [{ label: 'Liquid ISK' }, { label: 'Liquid ISK', value: '12.4B' }]
        }
      },
      followUps: [{ title: 'Missing rationale' }, { title: 'Review stock', rationale: 'Below threshold.' }],
      provenance: { sourceCount: 0, sourceReferences: [], createdAt: '2026-06-01T12:00:00.000Z' },
      createdAt: '2026-06-01T12:00:00.000Z'
    });

    expect(normalized.sections.find((section) => section.key === 'wallet')?.metrics).toHaveLength(1);
    expect(normalized.followUps).toHaveLength(1);
  });
});
