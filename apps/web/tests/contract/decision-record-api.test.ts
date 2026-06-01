import { describe, expect, it } from 'vitest';
import {
  createDecisionRecordRequestSchema,
  decisionRecordListResponseSchema,
  decisionRecordResponseSchema,
  updateDecisionStatusRequestSchema
} from '@gryyk/contracts';
import { approvedDecision, proposedDecision } from '../fixtures/decisionRecords';

describe('Decision Record API contract', () => {
  it('accepts decision list responses', () => {
    const parsed = decisionRecordListResponseSchema.parse({ decisions: [proposedDecision] });

    expect(parsed.decisions[0].sourceBriefId).toBe('brief-1');
  });

  it('accepts decision mutation responses', () => {
    const parsed = decisionRecordResponseSchema.parse({ decision: approvedDecision });

    expect(parsed.decision.status).toBe('approved');
    expect(parsed.decision.approval?.approvalText).toContain('approve');
  });

  it('accepts create requests and rejects missing source brief ids', () => {
    expect(
      createDecisionRecordRequestSchema.parse({
        sourceBriefId: 'brief-1',
        sourceRecommendation: 'Review member readiness.',
        rationale: 'Patch timing matters.',
        expectedResult: 'Leadership has a follow-up.',
        isPlayerImpacting: false
      }).sourceBriefId
    ).toBe('brief-1');

    expect(() =>
      createDecisionRecordRequestSchema.parse({
        sourceRecommendation: 'Review member readiness.',
        rationale: 'Patch timing matters.',
        expectedResult: 'Leadership has a follow-up.',
        isPlayerImpacting: false
      })
    ).toThrow();
  });

  it('accepts status update requests', () => {
    expect(
      updateDecisionStatusRequestSchema.parse({
        status: 'approved',
        approvalText: 'I approve this follow-up.'
      }).status
    ).toBe('approved');
  });
});
