import { useEffect, useState } from 'react';
import type {
  CreateLeadershipFollowUpRequest,
  FollowUpStatus,
  LeadershipFollowUp,
  MemberProfile
} from '@gryyk/contracts';
import { createFollowUp, getMember, listFollowUps, listMembers } from '../services/peopleClient';

interface PeopleState {
  members: MemberProfile[];
  followUps: LeadershipFollowUp[];
  selectedMember: MemberProfile | null;
  selectedMemberFollowUps: LeadershipFollowUp[];
  loading: boolean;
  error: string | null;
  activityFilter: 'all' | 'active' | 'stale' | 'missing';
  followUpStatusFilter: FollowUpStatus | 'all';
}

interface UsePeopleState extends PeopleState {
  createMemberFollowUp: (request: CreateLeadershipFollowUpRequest) => Promise<LeadershipFollowUp>;
  loadMember: (id: string) => Promise<MemberProfile>;
  selectMember: (member: MemberProfile | null) => void;
  setActivityFilter: (filter: PeopleState['activityFilter']) => void;
  setFollowUpStatusFilter: (filter: PeopleState['followUpStatusFilter']) => void;
}

export function usePeople(): UsePeopleState {
  const [state, setState] = useState<PeopleState>({
    members: [],
    followUps: [],
    selectedMember: null,
    selectedMemberFollowUps: [],
    loading: true,
    error: null,
    activityFilter: 'all',
    followUpStatusFilter: 'all'
  });

  const activityFilter = state.activityFilter;
  const followUpStatusFilter = state.followUpStatusFilter;

  useEffect(() => {
    let active = true;

    Promise.all([
      listMembers(activityFilter === 'all' ? {} : { activity: activityFilter }),
      listFollowUps(followUpStatusFilter === 'all' ? {} : { status: followUpStatusFilter })
    ])
      .then(([memberResponse, followUpResponse]) => {
        if (!active) {
          return;
        }

        const selectedMember = memberResponse.members[0] ?? null;
        setState((current) => ({
          ...current,
          members: memberResponse.members,
          followUps: followUpResponse.followUps,
          selectedMember: current.selectedMember ?? selectedMember,
          selectedMemberFollowUps: current.selectedMember
            ? current.selectedMemberFollowUps
            : followUpResponse.followUps.filter((followUp) => followUp.memberProfileId === selectedMember?.id),
          loading: false,
          error: null
        }));
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load people operating layer.'
        }));
      });

    return () => {
      active = false;
    };
  }, [activityFilter, followUpStatusFilter]);

  async function loadMember(id: string): Promise<MemberProfile> {
    const { member, followUps } = await getMember(id);
    setState((current) => ({
      ...current,
      members: current.members.map((item) => (item.id === member.id ? member : item)),
      selectedMember: member,
      selectedMemberFollowUps: followUps,
      error: null
    }));
    return member;
  }

  async function createMemberFollowUp(request: CreateLeadershipFollowUpRequest): Promise<LeadershipFollowUp> {
    const { followUp } = await createFollowUp(request);
    setState((current) => ({
      ...current,
      followUps: [followUp, ...current.followUps.filter((item) => item.id !== followUp.id)],
      selectedMemberFollowUps:
        current.selectedMember?.id === followUp.memberProfileId
          ? [followUp, ...current.selectedMemberFollowUps.filter((item) => item.id !== followUp.id)]
          : current.selectedMemberFollowUps,
      error: null
    }));
    return followUp;
  }

  return {
    ...state,
    createMemberFollowUp,
    loadMember,
    selectMember: (member) => {
      setState((current) => ({
        ...current,
        selectedMember: member,
        selectedMemberFollowUps: member ? current.followUps.filter((followUp) => followUp.memberProfileId === member.id) : []
      }));
    },
    setActivityFilter: (activityFilter) => setState((current) => ({ ...current, activityFilter })),
    setFollowUpStatusFilter: (followUpStatusFilter) => setState((current) => ({ ...current, followUpStatusFilter }))
  };
}
