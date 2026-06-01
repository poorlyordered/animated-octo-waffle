import { researchStatusResponseSchema } from '@gryyk/contracts';
import { failedRequest, processedRequest, processingRequest } from '../fixtures/commandBrief';

describe('GET /api/research-status contract', () => {
  it.each([processedRequest, processingRequest, failedRequest])('accepts %s status responses', (request) => {
    const parsed = researchStatusResponseSchema.parse({ request });

    expect(parsed.request?.status).toBe(request.status);
  });

  it('accepts an empty research status response', () => {
    expect(researchStatusResponseSchema.parse({ request: null })).toEqual({ request: null });
  });
});
