import type { FollowUpStatus, LeadershipFollowUp } from '@gryyk/contracts';

interface PeopleFollowUpListProps {
  followUps: LeadershipFollowUp[];
  statusFilter: FollowUpStatus | 'all';
  onStatusFilterChange: (status: FollowUpStatus | 'all') => void;
}

const statuses: Array<FollowUpStatus | 'all'> = ['all', 'open', 'blocked', 'completed', 'canceled'];

export function PeopleFollowUpList({ followUps, statusFilter, onStatusFilterChange }: PeopleFollowUpListProps) {
  return (
    <section aria-label="Leadership follow-ups">
      <h2>Leadership follow-ups</h2>
      <label>
        Follow-up status
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as FollowUpStatus | 'all')}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      {followUps.length === 0 ? (
        <p className="empty-state">No leadership follow-ups are available.</p>
      ) : (
        <ul>
          {followUps.map((followUp) => (
            <li key={followUp.id}>
              <strong>{followUp.memberDisplayName}</strong>: {followUp.reason} ({followUp.priority}, {followUp.status})
              {followUp.owner ? <span> Owner: {followUp.owner}</span> : null}
              {followUp.sourceContext.decisionId ? <span> Decision: {followUp.sourceContext.decisionId}</span> : null}
              {followUp.sourceContext.queueItemId ? <span> Queue: {followUp.sourceContext.queueItemId}</span> : null}
              {followUp.isPlayerImpacting ? <span> Approval recorded: {followUp.approval ? 'yes' : 'missing'}</span> : null}
              {followUp.sourceContext.missingLinkReasons.length > 0 ? (
                <ul className="missing-reasons">
                  {followUp.sourceContext.missingLinkReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
