import { operationsHealthResponseSchema, type OperationsHealthResponse } from '@gryyk/contracts';

export async function getOperationsHealth(): Promise<OperationsHealthResponse> {
  const response = await fetch('/api/operations-health');

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return operationsHealthResponseSchema.parse(await response.json());
}
