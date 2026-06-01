import { PeopleFollowUpCreate } from '../features/people/components/PeopleFollowUpCreate';
import { PeopleFollowUpList } from '../features/people/components/PeopleFollowUpList';
import { PeopleMemberDetail } from '../features/people/components/PeopleMemberDetail';
import { PeopleMemberList } from '../features/people/components/PeopleMemberList';
import { usePeople } from '../features/people/state/usePeople';

export function PeopleRoute() {
  const people = usePeople();

  if (people.loading) {
    return <main className="command-brief">Loading people operating layer...</main>;
  }

  if (people.error) {
    return <main className="command-brief error-state">{people.error}</main>;
  }

  return (
    <main className="command-brief">
      <header className="brief-header">
        <div>
          <p className="eyebrow">Gryyk-47 People</p>
          <h1>People operating layer</h1>
        </div>
      </header>
      <PeopleMemberList
        members={people.members}
        selectedMemberId={people.selectedMember?.id}
        activityFilter={people.activityFilter}
        onSelect={(member) => {
          people.selectMember(member);
          void people.loadMember(member.id);
        }}
        onActivityFilterChange={people.setActivityFilter}
      />
      <PeopleMemberDetail member={people.selectedMember} followUps={people.selectedMemberFollowUps} />
      <PeopleFollowUpCreate member={people.selectedMember} onCreate={people.createMemberFollowUp} />
      <PeopleFollowUpList
        followUps={people.followUps}
        statusFilter={people.followUpStatusFilter}
        onStatusFilterChange={people.setFollowUpStatusFilter}
      />
    </main>
  );
}
