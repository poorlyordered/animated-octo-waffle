import type { NumbersSnapshot } from '@gryyk/contracts';

export const numbersSnapshot: NumbersSnapshot = {
  id: 'numbers-1',
  corporationId: '917701062',
  focus: 'corporation',
  sections: [
    {
      key: 'wallet',
      label: 'Wallet',
      status: 'healthy',
      summary: 'Wallet runway is stable.',
      metrics: [{ label: 'Liquid ISK', value: '12.4B', unit: 'ISK', trend: 'up', severity: 'info' }],
      updatedAt: '2026-06-01T12:00:00.000Z'
    },
    {
      key: 'assets',
      label: 'Assets',
      status: 'watch',
      summary: 'Asset concentration is high in one staging system.',
      metrics: [{ label: 'High-value hulls', value: '18', trend: 'flat', severity: 'watch' }],
      updatedAt: '2026-06-01T12:00:00.000Z'
    },
    {
      key: 'logistics',
      label: 'Logistics',
      status: 'critical',
      summary: 'Doctrine stock is below threshold.',
      metrics: [{ label: 'Doctrine stock coverage', value: '42', unit: '%', trend: 'down', severity: 'critical' }],
      updatedAt: '2026-06-01T12:00:00.000Z'
    },
    {
      key: 'market',
      label: 'Market',
      status: 'stale',
      summary: 'Market data needs refresh before pricing decisions.',
      metrics: [{ label: 'Tracked orders', value: '36', trend: 'unknown', severity: 'watch' }],
      updatedAt: '2026-05-28T12:00:00.000Z',
      staleReason: 'Market data is older than the accepted freshness window.'
    },
    {
      key: 'activity',
      label: 'Activity',
      status: 'missing',
      summary: 'Activity data is missing.',
      metrics: [],
      missingReason: 'Activity data is not available in the processed snapshot.'
    }
  ],
  observations: ['Wallet runway is stable.', 'Doctrine stock is below threshold.'],
  risks: ['Logistics shortage may delay deployment readiness.'],
  opportunities: ['Market gap detected for doctrine modules.'],
  followUps: [
    {
      id: 'numbers-follow-up-1',
      title: 'Review logistics stockout risk',
      rationale: 'Doctrine stock coverage is below threshold.',
      suggestedPath: 'decision',
      isPlayerImpacting: false,
      relatedSection: 'logistics'
    },
    {
      id: 'numbers-follow-up-2',
      title: 'Approve asset repositioning plan',
      rationale: 'Asset concentration creates operational risk.',
      suggestedPath: 'queue',
      isPlayerImpacting: true,
      relatedSection: 'assets'
    }
  ],
  provenance: {
    sourceCount: 2,
    sourceReferences: [{ title: 'Processed wallet and asset extract', sourceId: 'numbers-source-1' }],
    confidence: 0.82,
    model: 'processed-numbers-v1',
    promptVersion: 'numbers-snapshot-v1',
    createdAt: '2026-06-01T12:00:00.000Z'
  },
  coverage: {
    numbers: 'present',
    opportunity: 'present',
    people: 'missing',
    missingReasons: ['People data is not part of this numbers snapshot.']
  },
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z'
};
