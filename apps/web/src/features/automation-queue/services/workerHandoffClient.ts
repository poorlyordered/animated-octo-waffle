import {
  prepareWorkerHandoffRequestSchema,
  workerHandoffListResponseSchema,
  workerHandoffResponseSchema,
  type PrepareWorkerHandoffRequest,
  type WorkerHandoffListResponse,
  type WorkerHandoffResponse,
  type WorkerHandoffStatus
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export async function prepareWorkerHandoff(
  queueItemId: string,
  request: PrepareWorkerHandoffRequest = {}
): Promise<WorkerHandoffResponse> {
  const response = await fetch(`/api/automation-queue/${queueItemId}/handoff`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(prepareWorkerHandoffRequestSchema.parse(request))
  });

  return parseJson(response, workerHandoffResponseSchema);
}

export async function listWorkerHandoffs(filters: {
  status?: WorkerHandoffStatus;
  queueItemId?: string;
} = {}): Promise<WorkerHandoffListResponse> {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.queueItemId) {
    params.set('queueItemId', filters.queueItemId);
  }

  const response = await fetch(`/api/worker-handoffs${params.size ? `?${params.toString()}` : ''}`);
  return parseJson(response, workerHandoffListResponseSchema);
}
