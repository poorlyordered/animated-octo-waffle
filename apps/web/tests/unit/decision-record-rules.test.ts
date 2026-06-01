import {
  assertApprovalBoundary,
  assertDecisionTransition,
  isValidDecisionTransition,
  requiresApprovalForStatus
} from '../../../../netlify/functions/_shared/decision-record-rules';

describe('decision record rules', () => {
  it('allows valid status transitions', () => {
    expect(isValidDecisionTransition('proposed', 'approved')).toBe(true);
    expect(isValidDecisionTransition('approved', 'delegated')).toBe(true);
    expect(isValidDecisionTransition('delegated', 'done')).toBe(true);
  });

  it('rejects invalid status transitions', () => {
    expect(isValidDecisionTransition('done', 'approved')).toBe(false);
    expect(() => assertDecisionTransition('rejected', 'done')).toThrow('Invalid decision status transition');
  });

  it('requires approval for player-impacting progression', () => {
    expect(requiresApprovalForStatus(true, 'approved')).toBe(true);
    expect(requiresApprovalForStatus(false, 'approved')).toBe(false);
    expect(() => assertApprovalBoundary(true, 'approved')).toThrow('Explicit approval');
    expect(() => assertApprovalBoundary(true, 'approved', 'Approved')).not.toThrow();
  });
});
