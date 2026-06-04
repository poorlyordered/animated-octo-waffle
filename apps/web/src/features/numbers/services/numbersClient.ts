import {
  numbersFollowUpDecisionResponseSchema,
  numbersFollowUpQueueResponseSchema,
  numbersSnapshotResponseSchema,
  type CreateNumbersFollowUpDecisionRequest,
  type CreateNumbersFollowUpQueueRequest,
  type NumbersFollowUpDecisionResponse,
  type NumbersFollowUpQueueResponse,
  type NumbersSnapshotResponse,
  type UpdateNumbersFollowUpDecisionStatusRequest
} from '@gryyk/contracts';

export async function getNumbersSnapshot(focus = 'corporation'): Promise<NumbersSnapshotResponse> {
  const params = new URLSearchParams({ focus });
  const response = await fetch(`/api/numbers?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return numbersSnapshotResponseSchema.parse(await response.json());
}

export async function createNumbersFollowUpDecision(
  candidateId: string,
  request: CreateNumbersFollowUpDecisionRequest
): Promise<NumbersFollowUpDecisionResponse> {
  const response = await fetch(`/api/numbers/follow-ups/${encodeURIComponent(candidateId)}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return numbersFollowUpDecisionResponseSchema.parse(await response.json());
}

export async function updateNumbersFollowUpDecisionStatus(
  candidateId: string,
  request: UpdateNumbersFollowUpDecisionStatusRequest
): Promise<NumbersFollowUpDecisionResponse> {
  const response = await fetch(`/api/numbers/follow-ups/${encodeURIComponent(candidateId)}/decision/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return numbersFollowUpDecisionResponseSchema.parse(await response.json());
}

export async function createNumbersFollowUpQueue(
  candidateId: string,
  request: CreateNumbersFollowUpQueueRequest
): Promise<NumbersFollowUpQueueResponse> {
  const response = await fetch(`/api/numbers/follow-ups/${encodeURIComponent(candidateId)}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return numbersFollowUpQueueResponseSchema.parse(await response.json());
}
