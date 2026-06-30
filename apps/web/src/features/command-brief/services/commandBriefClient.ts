import {
  commandBriefResponseSchema,
  prepareOpportunityIngestionRequestSchema,
  prepareOpportunityIngestionResponseSchema,
  researchStatusResponseSchema,
  type CommandBriefResponse,
  type PrepareOpportunityIngestionRequest,
  type PrepareOpportunityIngestionResponse,
  type ResearchStatusResponse
} from '@gryyk/contracts';

interface RequestOptions {
  focus?: string;
}

async function getJson<T>(path: string, schema: { parse(value: unknown): T }, options: RequestOptions): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (options.focus) {
    url.searchParams.set('focus', options.focus);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export function getCommandBrief(options: RequestOptions): Promise<CommandBriefResponse> {
  return getJson('/api/command-brief', commandBriefResponseSchema, options);
}

export async function prepareOpportunityIngestion(
  request: PrepareOpportunityIngestionRequest = {},
  options: RequestOptions = {}
): Promise<PrepareOpportunityIngestionResponse> {
  const url = new URL('/api/command-brief/opportunity/prepare', window.location.origin);
  if (options.focus) {
    url.searchParams.set('focus', options.focus);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(prepareOpportunityIngestionRequestSchema.parse(request))
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return prepareOpportunityIngestionResponseSchema.parse(await response.json());
}

export function getResearchStatus(options: RequestOptions): Promise<ResearchStatusResponse> {
  return getJson('/api/research-status', researchStatusResponseSchema, options);
}
