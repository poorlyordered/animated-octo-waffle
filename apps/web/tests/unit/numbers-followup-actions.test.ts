import { normalizeDecisionRecordDocument } from '../../../../netlify/functions/_shared/decision-record-normalizer';
import {
  assertNoUnsafeNumbersFollowUpFields,
  assertNoUnsafeNumbersFollowUpStatusFields,
  numbersApprovalHandoff
} from '../../../../netlify/functions/_shared/numbers-followup-actions';
import { numbersFollowUpDecision, numbersFollowUpOrigin } from '../fixtures/numbersFollowUpActions';

describe('numbers follow-up actions', () => {
  it('preserves Numbers follow-up source context when normalizing decisions', () => {
    const normalized = normalizeDecisionRecordDocument({
      ...numbersFollowUpDecision,
      _id: { toString: () => numbersFollowUpDecision.id }
    });

    expect(normalized.sourceContext).toEqual(numbersFollowUpOrigin);
    expect(normalized.sourceProvenance.briefId).toBe(numbersFollowUpOrigin.snapshotId);
  });

  it('rejects unsafe action fields in follow-up action requests', () => {
    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        corporationId: 'browser-corp'
      })
    ).toThrow('Unsafe Numbers follow-up action field rejected: corporationId');

    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        walletAction: 'transfer'
      })
    ).toThrow('Unsafe Numbers follow-up action field rejected: walletAction');

    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        approvalHandoff: { queueReady: true }
      })
    ).toThrow('Unsafe Numbers follow-up action field rejected: approvalHandoff');

    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        queueStatus: 'queued'
      })
    ).toThrow('Unsafe Numbers follow-up action field rejected: queueStatus');
  });

  it('allows bounded follow-up action request fields', () => {
    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        expectedResult: 'Commander review is recorded.'
      })
    ).not.toThrow();
  });

  it('allows bounded follow-up status request fields and rejects execution fields', () => {
    expect(() =>
      assertNoUnsafeNumbersFollowUpStatusFields({
        snapshotId: 'numbers-1',
        sourceDecisionId: 'decision-1',
        status: 'approved',
        approvalText: 'Commander approves this follow-up.',
        note: 'Approval captured.'
      })
    ).not.toThrow();

    expect(() =>
      assertNoUnsafeNumbersFollowUpStatusFields({
        snapshotId: 'numbers-1',
        sourceDecisionId: 'decision-1',
        status: 'approved',
        queueStatus: 'queued'
      })
    ).toThrow('Unsafe Numbers follow-up status field rejected: queueStatus');

    expect(() =>
      assertNoUnsafeNumbersFollowUpStatusFields({
        snapshotId: 'numbers-1',
        sourceDecisionId: 'decision-1',
        status: 'approved',
        decisionStatus: 'approved'
      })
    ).toThrow('Unsafe Numbers follow-up status field rejected: decisionStatus');

    expect(() =>
      assertNoUnsafeNumbersFollowUpStatusFields({
        snapshotId: 'numbers-1',
        sourceDecisionId: 'decision-1',
        status: 'approved',
        dispatchTarget: 'worker'
      })
    ).toThrow('Unsafe Numbers follow-up status field rejected: dispatchTarget');
  });

  it('marks rejected Numbers decisions as queue blocked without requiring more approval', () => {
    const handoff = numbersApprovalHandoff(numbersFollowUpOrigin, {
      ...numbersFollowUpDecision,
      status: 'rejected'
    });

    expect(handoff.approvalRequired).toBe(false);
    expect(handoff.queueReady).toBe(false);
    expect(handoff.message).toContain('Queued work cannot be created');
  });
});
