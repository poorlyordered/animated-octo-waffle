export interface FunctionEvent {
  headers?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export interface AuthScope {
  corporationId: string;
}

export function getAuthScope(event: FunctionEvent): AuthScope {
  const corporationId =
    event.headers?.['x-corporation-id'] ??
    event.headers?.['X-Corporation-Id'] ??
    event.queryStringParameters?.corporationId;

  if (!corporationId) {
    throw new Error('Missing corporation scope');
  }

  return { corporationId };
}
