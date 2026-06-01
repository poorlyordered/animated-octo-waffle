import {
  commandBriefResponseSchema,
  researchStatusResponseSchema,
  type CommandBriefResponse,
  type ResearchStatusResponse
} from '@gryyk/contracts';

interface RequestOptions {
  corporationId: string;
  focus?: string;
}

async function getJson<T>(path: string, schema: { parse(value: unknown): T }, options: RequestOptions): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (options.focus) {
    url.searchParams.set('focus', options.focus);
  }

  const response = await fetch(url, {
    headers: {
      'x-corporation-id': options.corporationId
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return schema.parse(await response.json());
}

export function getCommandBrief(options: RequestOptions): Promise<CommandBriefResponse> {
  return getJson('/api/command-brief', commandBriefResponseSchema, options);
}

export function getResearchStatus(options: RequestOptions): Promise<ResearchStatusResponse> {
  return getJson('/api/research-status', researchStatusResponseSchema, options);
}
