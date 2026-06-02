import { normalizeDecisionRecordDocument } from '../../../../netlify/functions/_shared/decision-record-normalizer';
import { assertNoUnsafeNumbersFollowUpFields } from '../../../../netlify/functions/_shared/numbers-followup-actions';
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
  });

  it('allows bounded follow-up action request fields', () => {
    expect(() =>
      assertNoUnsafeNumbersFollowUpFields({
        snapshotId: 'numbers-1',
        expectedResult: 'Commander review is recorded.'
      })
    ).not.toThrow();
  });
});
