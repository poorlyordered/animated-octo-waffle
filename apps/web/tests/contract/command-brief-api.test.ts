import { commandBriefResponseSchema } from '@gryyk/contracts';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';
import { handler } from '../../../../netlify/functions/command-brief';
import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';
import { opportunityIngestionProvenance, processedBrief } from '../fixtures/commandBrief';

const originalEnv = process.env;

function signedSessionCookie(corporationId: string) {
  const signed = createSignedCookieValue(
    {
      characterId: '2110000001',
      characterName: 'Ari Voss',
      corporationId,
      corporationName: 'Other Corp',
      issuedAt: '2026-06-01T00:00:00.000Z',
      expiresAt: '2099-06-01T00:00:00.000Z',
      source: 'eve-sso'
    },
    'test-secret'
  );

  return `${sessionCookieName}=${encodeURIComponent(signed)}`;
}

describe('GET /api/command-brief contract', () => {
  afterEach(() => {
    process.env = originalEnv;
  });

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

  it('rejects signed command API sessions from another corporation', async () => {
    process.env = {
      ...originalEnv,
      EVEONLINE_CORPORATION_ID: '917701062',
      EVE_SESSION_SECRET: 'test-secret'
    };

    const response = await handler({
      headers: { cookie: signedSessionCookie('123456789') },
      httpMethod: 'GET'
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Signed EVE session is not authorized for this corporation'
    });
  });
});
