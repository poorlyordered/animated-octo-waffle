import {
  createIntelligenceRefreshRunRequestSchema,
  createIntelligenceRefreshRunResponseSchema,
  intelligenceRefreshRunListResponseSchema,
  intelligenceRefreshRunResponseSchema,
  type CreateIntelligenceRefreshRunRequest,
  type CreateIntelligenceRefreshRunResponse,
  type IntelligenceRefreshRunListResponse,
  type IntelligenceRefreshRunResponse
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? String(body.error) : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return schema.parse(body);
}

export async function listIntelligenceRefreshRuns(): Promise<IntelligenceRefreshRunListResponse> {
  const response = await fetch('/api/intelligence-refresh');
  return parseJson(response, intelligenceRefreshRunListResponseSchema);
}

export async function getIntelligenceRefreshRun(runId: string): Promise<IntelligenceRefreshRunResponse> {
  const response = await fetch(`/api/intelligence-refresh/${encodeURIComponent(runId)}`);
  return parseJson(response, intelligenceRefreshRunResponseSchema);
}

export async function createIntelligenceRefreshRun(
  request: CreateIntelligenceRefreshRunRequest
): Promise<CreateIntelligenceRefreshRunResponse> {
  const response = await fetch('/api/intelligence-refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createIntelligenceRefreshRunRequestSchema.parse(request))
  });

  return parseJson(response, createIntelligenceRefreshRunResponseSchema);
}
