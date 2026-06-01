import type { MemberProfile } from '@gryyk/contracts';

interface PeopleMemberListProps {
  members: MemberProfile[];
  selectedMemberId?: string;
  activityFilter: 'all' | 'active' | 'stale' | 'missing';
  onSelect: (member: MemberProfile) => void;
  onActivityFilterChange: (filter: 'all' | 'active' | 'stale' | 'missing') => void;
}

const activityFilters: Array<'all' | 'active' | 'stale' | 'missing'> = ['all', 'active', 'stale', 'missing'];

export function PeopleMemberList({
  members,
  selectedMemberId,
  activityFilter,
  onSelect,
  onActivityFilterChange
}: PeopleMemberListProps) {
  return (
    <section aria-label="Member command profiles">
      <h2>Member profiles</h2>
      <label>
        Activity filter
        <select
          value={activityFilter}
          onChange={(event) => onActivityFilterChange(event.target.value as 'all' | 'active' | 'stale' | 'missing')}
        >
          {activityFilters.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </label>
      {members.length === 0 ? (
        <p className="empty-state">No member profiles are available.</p>
      ) : (
        <div className="decision-list">
          {members.map((member) => (
            <button
              className={member.id === selectedMemberId ? 'decision-list-item selected' : 'decision-list-item'}
              key={member.id}
              type="button"
              onClick={() => onSelect(member)}
            >
              <span>{member.displayName}</span>
              <strong>{member.activitySummary.isStale ? 'stale' : member.activitySummary.activityLabel}</strong>
              {member.followUpSummary.open + member.followUpSummary.blocked > 0 ? (
                <small>{member.followUpSummary.open + member.followUpSummary.blocked} follow-ups</small>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
