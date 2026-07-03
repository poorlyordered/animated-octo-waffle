import {
  createIntelligenceRefreshRunRequestSchema,
  createIntelligenceRefreshRunResponseSchema,
  intelligenceRefreshReadinessResponseSchema,
  intelligenceRefreshRunListResponseSchema,
  intelligenceRefreshRunDetailResponseSchema,
  intelligenceRefreshStepRetryRequestSchema,
  intelligenceRefreshStepRetryResponseSchema,
  intelligenceRefreshStepSkipRequestSchema,
  intelligenceRefreshStepSkipResponseSchema,
  type CreateIntelligenceRefreshRunRequest,
  type CreateIntelligenceRefreshRunResponse,
  type IntelligenceRefreshReadinessResponse,
  type IntelligenceRefreshRunDetailResponse,
  type IntelligenceRefreshRunListResponse,
  type IntelligenceRefreshStepRetryRequest,
  type IntelligenceRefreshStepRetryResponse,
  type IntelligenceRefreshStepSkipRequest,
  type IntelligenceRefreshStepSkipResponse
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

export async function getIntelligenceRefreshReadiness(): Promise<IntelligenceRefreshReadinessResponse> {
  const response = await fetch('/api/intelligence-refresh/readiness');
  return parseJson(response, intelligenceRefreshReadinessResponseSchema);
}

export async function getIntelligenceRefreshRun(runId: string): Promise<IntelligenceRefreshRunDetailResponse> {
  const response = await fetch(`/api/intelligence-refresh/${encodeURIComponent(runId)}`);
  return parseJson(response, intelligenceRefreshRunDetailResponseSchema);
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

export async function retryIntelligenceRefreshStep(
  runId: string,
  stepId: string,
  request: IntelligenceRefreshStepRetryRequest
): Promise<IntelligenceRefreshStepRetryResponse> {
  const response = await fetch(`/api/intelligence-refresh/${encodeURIComponent(runId)}/steps/${encodeURIComponent(stepId)}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intelligenceRefreshStepRetryRequestSchema.parse(request))
  });

  return parseJson(response, intelligenceRefreshStepRetryResponseSchema);
}

export async function skipIntelligenceRefreshStep(
  runId: string,
  stepId: string,
  request: IntelligenceRefreshStepSkipRequest
): Promise<IntelligenceRefreshStepSkipResponse> {
  const response = await fetch(`/api/intelligence-refresh/${encodeURIComponent(runId)}/steps/${encodeURIComponent(stepId)}/skip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intelligenceRefreshStepSkipRequestSchema.parse(request))
  });

  return parseJson(response, intelligenceRefreshStepSkipResponseSchema);
}
