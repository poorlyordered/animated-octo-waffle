import type { LeadershipFollowUp, MemberProfile } from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';

interface PeopleMemberDetailProps {
  member: MemberProfile | null;
  followUps: LeadershipFollowUp[];
}

function reasons(reasons: string[]) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <ul className="missing-reasons">
      {reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}

export function PeopleMemberDetail({ member, followUps }: PeopleMemberDetailProps) {
  if (!member) {
    return <section className="empty-state">Select a member profile.</section>;
  }

  return (
    <section className="decision-detail" aria-label="Member profile detail">
      <h2>{member.displayName}</h2>
      <p>{member.profileSummary || 'No profile summary recorded.'}</p>
      <dl>
        <div>
          <dt>Roles</dt>
          <dd>{member.roleContext.roles.length > 0 ? member.roleContext.roles.join(', ') : 'No roles recorded.'}</dd>
        </div>
        <div>
          <dt>Titles</dt>
          <dd>{member.roleContext.titles.length > 0 ? member.roleContext.titles.join(', ') : 'No titles recorded.'}</dd>
        </div>
        <div>
          <dt>Activity</dt>
          <dd>{member.activitySummary.activityLabel}</dd>
        </div>
        <div>
          <dt>Delegation</dt>
          <dd>{member.delegationNotes || 'No delegation notes recorded.'}</dd>
        </div>
      </dl>

      {member.roleContext.isStale || member.activitySummary.isStale ? (
        <p className="notice">Some people context is stale. Confirm before making leadership decisions.</p>
      ) : null}

      {reasons(member.coverage.missingReasons)}

      {member.operatingLegCoverage ? <OperatingLegCoverage coverage={member.operatingLegCoverage} /> : null}

      <section aria-label="Member follow-ups">
        <h3>Leadership follow-ups</h3>
        {followUps.length === 0 ? (
          <p className="empty-state">No leadership follow-ups recorded.</p>
        ) : (
          <ul>
            {followUps.map((followUp) => (
              <li key={followUp.id}>
                <strong>{followUp.priority}</strong> {followUp.reason} ({followUp.status})
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
