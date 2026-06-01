import { readScopeEnv } from './env';

export interface FunctionEvent {
  headers?: Record<string, string | undefined>;
  httpMethod?: string;
  path?: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export interface AuthScope {
  corporationId: string;
}

export function getAuthScope(): AuthScope {
  return readScopeEnv();
}
