import { operationsHealthResponseSchema } from '@gryyk/contracts';
import { operationsHealthResponse } from '../fixtures/operationsHealth';

describe('GET /api/operations-health contract', () => {
  it('accepts browser-safe operations health summaries', () => {
    const parsed = operationsHealthResponseSchema.parse(operationsHealthResponse);

    expect(parsed.overallStatus).toBe('degraded');
    expect(parsed.workerReadiness.map((worker) => worker.secretState)).toContain('fallback');
    expect(parsed.boundary).toContain('read-only');
  });

  it('requires worker readiness to use safe secret state labels', () => {
    expect(() =>
      operationsHealthResponseSchema.parse({
        ...operationsHealthResponse,
        workerReadiness: [
          {
            ...operationsHealthResponse.workerReadiness[0],
            secretState: 'actual-secret-value'
          }
        ]
      })
    ).toThrow();
  });
});
