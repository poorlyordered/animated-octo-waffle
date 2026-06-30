import {
  createDecisionRecordRequestSchema,
  decisionRecordListResponseSchema,
  decisionRecordResponseSchema,
  updateDecisionStatusRequestSchema,
  type CreateDecisionRecordRequest,
  type DecisionRecordListResponse,
  type DecisionRecordSourceFilter,
  type DecisionRecordResponse,
  type DecisionStatus,
  type UpdateDecisionStatusRequest
} from '@gryyk/contracts';

async function parseJson<T>(response: Response, schema: { parse(value: unknown): T }): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export interface ListDecisionRecordFilters {
  source?: DecisionRecordSourceFilter;
  sourceBriefId?: string;
  status?: DecisionStatus;
}

export async function listDecisionRecords(filters: ListDecisionRecordFilters = {}): Promise<DecisionRecordListResponse> {
  const params = new URLSearchParams();

  if (filters.source) {
    params.set('source', filters.source);
  }

  if (filters.sourceBriefId) {
    params.set('sourceBriefId', filters.sourceBriefId);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  const response = await fetch(`/api/decision-records${params.size ? `?${params.toString()}` : ''}`);
  return parseJson(response, decisionRecordListResponseSchema);
}

export async function createDecisionRecord(request: CreateDecisionRecordRequest): Promise<DecisionRecordResponse> {
  const response = await fetch('/api/decision-records', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(createDecisionRecordRequestSchema.parse(request))
  });

  return parseJson(response, decisionRecordResponseSchema);
}

export async function updateDecisionStatus(
  decisionId: string,
  request: UpdateDecisionStatusRequest
): Promise<DecisionRecordResponse> {
  const response = await fetch(`/api/decision-records/${decisionId}/status`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(updateDecisionStatusRequestSchema.parse(request))
  });

  return parseJson(response, decisionRecordResponseSchema);
}
