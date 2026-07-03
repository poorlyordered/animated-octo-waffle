import {
  assertSafeRefreshWorkerResult,
  deriveRefreshRunStatus,
  refreshEvaluationReady,
  normalizeRefreshDomains
} from '../../../../netlify/functions/_shared/intelligence-refresh-rules';
import type { IntelligenceRefreshDomainStep } from '../../../../packages/contracts/src/index';

const completedStep = (domain: IntelligenceRefreshDomainStep['domain']): IntelligenceRefreshDomainStep => ({
  id: `step-${domain}`,
  domain,
  status: 'completed',
  sourceCount: 2,
  sectionStatuses: [{ key: 'snapshot', status: 'captured' }],
  warnings: []
});

describe('intelligence refresh rules', () => {
  it('normalizes supported domains in request order without duplicates', () => {
    expect(normalizeRefreshDomains(['people', 'numbers', 'people', 'opportunity'])).toEqual([
      'people',
      'numbers',
      'opportunity'
    ]);
  });

  it('derives waiting-for-evaluation when all domain steps are terminal with useful data', () => {
    expect(deriveRefreshRunStatus([completedStep('numbers'), completedStep('people')])).toBe('waiting_for_evaluation');
  });

  it('allows partial evaluation only when at least one terminal step completed', () => {
    const failed: IntelligenceRefreshDomainStep = {
      id: 'step-opportunity',
      domain: 'opportunity',
      status: 'failed',
      sectionStatuses: [],
      failure: { reason: 'Source unavailable', failedAt: new Date().toISOString() },
      warnings: []
    };
    const skipped: IntelligenceRefreshDomainStep = {
      id: 'step-people',
      domain: 'people',
      status: 'skipped',
      skippedAt: new Date().toISOString(),
      sectionStatuses: [],
      failure: { reason: 'No source delta', failedAt: new Date().toISOString() },
      warnings: []
    };

    expect(refreshEvaluationReady([completedStep('numbers'), failed], false)).toBe(false);
    expect(refreshEvaluationReady([completedStep('numbers'), failed], true)).toBe(true);
    expect(refreshEvaluationReady([completedStep('numbers'), skipped], true)).toBe(true);
    expect(refreshEvaluationReady([failed], true)).toBe(false);
  });

  it('rejects unsafe worker result summaries before they can be stored', () => {
    expect(() =>
      assertSafeRefreshWorkerResult({
        sourceCount: 1,
        summary: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 leaked',
        sectionStatuses: [],
        warnings: []
      })
    ).toThrow('Unsafe intelligence refresh field rejected');
  });
});
