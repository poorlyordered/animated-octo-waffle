import { normalizeMemberProfileDocument } from '../../../../netlify/functions/_shared/people-normalizer';
import { needsFollowUp } from '../../../../netlify/functions/_shared/people-rules';

describe('people member normalizer', () => {
  it('normalizes complete member profiles', () => {
    const member = normalizeMemberProfileDocument({
      _id: { toString: () => 'member-1' },
      corporationId: '917701062',
      displayName: 'Ari Voss',
      roleContext: {
        roles: ['Logistics'],
        titles: ['Quartermaster'],
        accessNotes: 'Has logistics context.',
        lastObservedAt: '2026-06-01T11:00:00.000Z'
      },
      activitySummary: {
        lastActiveAt: '2026-06-01T10:00:00.000Z',
        activityLabel: 'Active this week'
      },
      delegationNotes: 'Owns hauling coordination.',
      followUpSummary: { open: 1, blocked: 0, completed: 0 },
      sourceRefs: [{ title: 'Profile import', sourceId: null }],
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-01T11:00:00.000Z'
    });

    expect(member.coverage.roles).toBe('present');
    expect(member.sourceRefs).toEqual([{ title: 'Profile import' }]);
    expect(needsFollowUp(member)).toBe(true);
  });

  it('marks missing role and activity data', () => {
    const member = normalizeMemberProfileDocument({
      _id: { toString: () => 'member-2' },
      corporationId: '917701062',
      characterName: 'Unknown Scout',
      roleContext: {
        missingReasons: ['Role context is missing.']
      },
      activitySummary: {},
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-01T11:00:00.000Z'
    });

    expect(member.coverage.roles).toBe('missing');
    expect(member.coverage.activity).toBe('missing');
    expect(member.coverage.missingReasons).toContain('Activity timestamp is missing.');
  });

  it('preserves stale activity and role indicators', () => {
    const member = normalizeMemberProfileDocument({
      _id: { toString: () => 'member-3' },
      corporationId: '917701062',
      displayName: 'Mira Tal',
      roleContext: {
        roles: ['Scout'],
        isStale: true
      },
      activitySummary: {
        lastActiveAt: '2026-04-01T10:00:00.000Z',
        isStale: true
      },
      delegationNotes: 'Needs updated delegation.',
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-01T11:00:00.000Z'
    });

    expect(member.coverage.roles).toBe('stale');
    expect(member.coverage.activity).toBe('stale');
  });
});
