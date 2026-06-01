import { normalizeLeadershipFollowUpDocument } from '../../../../netlify/functions/_shared/people-normalizer';
import { assertFollowUpApprovalBoundary, assertNoDuplicateFollowUp } from '../../../../netlify/functions/_shared/people-rules';

describe('people follow-up normalizer', () => {
  it('normalizes follow-up source context and no-execution defaults', () => {
    const followUp = normalizeLeadershipFollowUpDocument({
      _id: { toString: () => 'follow-up-1' },
      corporationId: '917701062',
      memberProfileId: 'member-1',
      memberDisplayName: 'Ari Voss',
      reason: 'Confirm delegation.',
      priority: 'urgent',
      status: 'open',
      isPlayerImpacting: false,
      sourceContext: {
        memberProfileId: 'member-1',
        memberDisplayName: 'Ari Voss',
        coverage: {
          identity: 'present',
          roles: 'present',
          activity: 'present',
          delegation: 'present',
          missingReasons: []
        },
        createdAt: '2026-06-01T12:00:00.000Z'
      },
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z'
    });

    expect(followUp.status).toBe('open');
    expect(followUp.approval).toBeNull();
    expect(followUp.sourceContext.memberDisplayName).toBe('Ari Voss');
  });

  it('normalizes blocked, completed, linked, and missing-link metadata', () => {
    const followUp = normalizeLeadershipFollowUpDocument({
      _id: { toString: () => 'follow-up-2' },
      corporationId: '917701062',
      memberProfileId: 'member-1',
      memberDisplayName: 'Ari Voss',
      reason: 'Review linked decision.',
      priority: 'medium',
      status: 'completed',
      sourceDecisionId: 'decision-1',
      sourceQueueItemId: 'queue-1',
      sourceContext: {
        memberProfileId: 'member-1',
        memberDisplayName: 'Ari Voss',
        decisionId: 'decision-1',
        queueItemId: 'queue-1',
        missingLinkReasons: ['Source decision missing-decision was not found.'],
        coverage: {
          identity: 'present',
          roles: 'present',
          activity: 'present',
          delegation: 'present',
          missingReasons: []
        },
        createdAt: '2026-06-01T12:00:00.000Z'
      },
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z'
    });

    expect(followUp.status).toBe('completed');
    expect(followUp.sourceContext.queueItemId).toBe('queue-1');
    expect(followUp.sourceContext.missingLinkReasons).toHaveLength(1);
  });

  it('enforces duplicate and player-impacting approval boundaries', () => {
    expect(() => assertNoDuplicateFollowUp(true)).toThrow('Leadership follow-up already exists');
    expect(() =>
      assertFollowUpApprovalBoundary({
        memberProfileId: 'member-1',
        reason: 'Confirm access change.',
        priority: 'high',
        isPlayerImpacting: true
      })
    ).toThrow('Explicit approval is required');
  });
});
