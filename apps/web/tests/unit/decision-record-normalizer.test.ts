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

  it('drops null optional fields from stored source references', () => {
    const normalized = normalizeDecisionRecordDocument({
      _id: { toString: () => 'decision-1' },
      corporationId: '917701062',
      sourceBriefId: 'brief-1',
      sourceRecommendation: 'Scout the opportunity.',
      rationale: 'The opportunity needs validation.',
      expectedResult: 'A commander can approve or reject the path.',
      status: 'proposed',
      isPlayerImpacting: false,
      approval: null,
      statusHistory: [{ toStatus: 'proposed', changedAt: '2026-06-01T12:00:00.000Z' }],
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
      sourceProvenance: {
        briefId: 'brief-1',
        briefCreatedAt: '2026-06-01T11:00:00.000Z',
        focus: 'grykk-47-eve-official-news',
        model: 'test-model',
        promptVersion: 'test-prompt',
        confidence: 0.8,
        sourceCount: 1,
        sourceReferences: [{ title: 'EVE update', url: undefined, sourceId: null }],
        coverage: processedBrief.coverage
      }
    });

    expect(normalized.sourceProvenance.sourceReferences).toEqual([{ title: 'EVE update' }]);
  });
});
