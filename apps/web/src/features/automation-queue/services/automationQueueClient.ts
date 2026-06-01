import {
  automationQueueItemResponseSchema,
  automationQueueListResponseSchema,
  createAutomationQueueItemRequestSchema,
  type AutomationQueueItemResponse,
  type AutomationQueueListResponse,
  type CreateAutomationQueueItemRequest,
  type QueueStatus
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export async function listAutomationQueueItems(filters: {
  status?: QueueStatus;
  sourceDecisionId?: string;
} = {}): Promise<AutomationQueueListResponse> {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.sourceDecisionId) {
    params.set('sourceDecisionId', filters.sourceDecisionId);
  }

  const response = await fetch(`/api/automation-queue${params.size ? `?${params.toString()}` : ''}`);
  return parseJson(response, automationQueueListResponseSchema);
}

export async function getAutomationQueueItem(id: string): Promise<AutomationQueueItemResponse> {
  const response = await fetch(`/api/automation-queue/${id}`);
  return parseJson(response, automationQueueItemResponseSchema);
}

export async function createAutomationQueueItem(
  request: CreateAutomationQueueItemRequest
): Promise<AutomationQueueItemResponse> {
  const response = await fetch('/api/automation-queue', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(createAutomationQueueItemRequestSchema.parse(request))
  });

  return parseJson(response, automationQueueItemResponseSchema);
}
