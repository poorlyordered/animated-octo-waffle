import { describe, expect, it } from 'vitest';
import { normalizeDecisionRecordDocument, sourceProvenanceFromBrief } from '../../../../netlify/functions/_shared/decision-record-normalizer';
import { processedBrief } from '../fixtures/commandBrief';

describe('decision record normalizer', () => {
  it('maps command brief provenance into a decision snapshot', () => {
    const provenance = sourceProvenanceFromBrief(processedBrief);

    expect(provenance.briefId).toBe(processedBrief.id);
    expect(provenance.coverage.opportunity).toBe('present');
  });

  it('normalizes legacy strategic_decisions fields', () => {
    const normalized = normalizeDecisionRecordDocument({
      _id: { toString: () => 'legacy-1' },
      corporationId: '917701062',
      researchBriefId: 'brief-legacy',
      decisionContext: 'Legacy context',
      finalDecision: 'Legacy decision',
      timestamp: new Date('2026-06-01T12:00:00.000Z')
    });

    expect(normalized.id).toBe('legacy-1');
    expect(normalized.sourceBriefId).toBe('brief-legacy');
    expect(normalized.rationale).toBe('Legacy context');
    expect(normalized.expectedResult).toBe('Legacy decision');
    expect(normalized.status).toBe('proposed');
  });
});
