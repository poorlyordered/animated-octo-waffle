import {
  createLeadershipFollowUpRequestSchema,
  createPeopleFollowUpDecisionRequestSchema,
  createPeopleFollowUpQueueRequestSchema,
  leadershipFollowUpListResponseSchema,
  leadershipFollowUpResponseSchema,
  memberProfileDetailResponseSchema,
  memberProfileListResponseSchema,
  peopleFollowUpDecisionResponseSchema,
  peopleFollowUpQueueResponseSchema,
  updatePeopleFollowUpDecisionStatusRequestSchema,
  type CreateLeadershipFollowUpRequest,
  type CreatePeopleFollowUpDecisionRequest,
  type CreatePeopleFollowUpQueueRequest,
  type FollowUpPriority,
  type FollowUpStatus,
  type LeadershipFollowUpListResponse,
  type LeadershipFollowUpResponse,
  type MemberProfileDetailResponse,
  type MemberProfileListResponse,
  type PeopleFollowUpDecisionResponse,
  type PeopleFollowUpQueueResponse,
  type UpdatePeopleFollowUpDecisionStatusRequest
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export async function listMembers(filters: {
  activity?: 'active' | 'stale' | 'missing';
  needsFollowUp?: boolean;
} = {}): Promise<MemberProfileListResponse> {
  const params = new URLSearchParams();
  if (filters.activity) {
    params.set('activity', filters.activity);
  }
  if (filters.needsFollowUp !== undefined) {
    params.set('needsFollowUp', String(filters.needsFollowUp));
  }

  const response = await fetch(`/api/people/members${params.size ? `?${params.toString()}` : ''}`);
  return parseJson(response, memberProfileListResponseSchema);
}

export async function getMember(id: string): Promise<MemberProfileDetailResponse> {
  const response = await fetch(`/api/people/members/${id}`);
  return parseJson(response, memberProfileDetailResponseSchema);
}

export async function listFollowUps(filters: {
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  memberProfileId?: string;
} = {}): Promise<LeadershipFollowUpListResponse> {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.priority) {
    params.set('priority', filters.priority);
  }
  if (filters.memberProfileId) {
    params.set('memberProfileId', filters.memberProfileId);
  }

  const response = await fetch(`/api/people/follow-ups${params.size ? `?${params.toString()}` : ''}`);
  return parseJson(response, leadershipFollowUpListResponseSchema);
}

export async function createFollowUp(request: CreateLeadershipFollowUpRequest): Promise<LeadershipFollowUpResponse> {
  const response = await fetch('/api/people/follow-ups', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(createLeadershipFollowUpRequestSchema.parse(request))
  });

  return parseJson(response, leadershipFollowUpResponseSchema);
}

export async function recordPeopleFollowUpDecision(
  followUpId: string,
  request: CreatePeopleFollowUpDecisionRequest
): Promise<PeopleFollowUpDecisionResponse> {
  const response = await fetch(`/api/people/follow-ups/${encodeURIComponent(followUpId)}/decision`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(createPeopleFollowUpDecisionRequestSchema.parse(request))
  });

  return parseJson(response, peopleFollowUpDecisionResponseSchema);
}

export async function updatePeopleFollowUpDecisionStatus(
  followUpId: string,
  request: UpdatePeopleFollowUpDecisionStatusRequest
): Promise<PeopleFollowUpDecisionResponse> {
  const response = await fetch(`/api/people/follow-ups/${encodeURIComponent(followUpId)}/decision/status`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(updatePeopleFollowUpDecisionStatusRequestSchema.parse(request))
  });

  return parseJson(response, peopleFollowUpDecisionResponseSchema);
}

export async function createPeopleFollowUpQueue(
  followUpId: string,
  request: CreatePeopleFollowUpQueueRequest
): Promise<PeopleFollowUpQueueResponse> {
  const response = await fetch(`/api/people/follow-ups/${encodeURIComponent(followUpId)}/queue`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(createPeopleFollowUpQueueRequestSchema.parse(request))
  });

  return parseJson(response, peopleFollowUpQueueResponseSchema);
}
