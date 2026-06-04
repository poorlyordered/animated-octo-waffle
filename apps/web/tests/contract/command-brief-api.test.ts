import { commandBriefResponseSchema } from '@gryyk/contracts';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';
import { opportunityIngestionProvenance, processedBrief } from '../fixtures/commandBrief';

describe('GET /api/command-brief contract', () => {
  it('accepts a processed command brief response with provenance metadata', () => {
    const parsed = commandBriefResponseSchema.parse({ brief: processedBrief, opportunityProvenance: opportunityIngestionProvenance });

    expect(parsed.brief?.promptVersion).toBe('official-news-brief-v1');
    expect(parsed.brief?.sourceReferences).toHaveLength(1);
    expect(parsed.opportunityProvenance?.history[0].status).toBe('processed');
  });

  it('accepts an empty command brief response', () => {
    expect(commandBriefResponseSchema.parse({ brief: null })).toEqual({ brief: null });
  });

  it('keeps no-session fallback corporation scope for local command API reads', () => {
    const scope = getAuthScope(
      { headers: {}, queryStringParameters: { corporationId: 'browser-query' } },
      { EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' }
    );

    expect(scope).toEqual({
      corporationId: '917701062',
      source: 'fallback'
    });
  });
});
