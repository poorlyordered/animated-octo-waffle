import {
  commandBriefResponseSchema,
  opportunityIngestionWorkerClaimRequestSchema,
  opportunityIngestionWorkerCompleteRequestSchema,
  opportunityIngestionWorkerFailRequestSchema,
  opportunityIngestionWorkerListResponseSchema,
  opportunityIngestionWorkerResponseSchema,
  prepareOpportunityIngestionRequestSchema,
  prepareOpportunityIngestionResponseSchema
} from '@gryyk/contracts';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';
import { handler } from '../../../../netlify/functions/command-brief';
import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';
import { opportunityIngestionProvenance, preparedOpportunityIngestionResponse, processedBrief } from '../fixtures/commandBrief';

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

  it('accepts Opportunity ingestion prepare and worker payloads', () => {
    expect(prepareOpportunityIngestionRequestSchema.parse({ reason: 'Refresh Opportunity context.' }).reason).toContain('Refresh');
    expect(prepareOpportunityIngestionResponseSchema.parse(preparedOpportunityIngestionResponse).request.status).toBe('queued');
    expect(opportunityIngestionWorkerClaimRequestSchema.parse({ workerId: 'opportunity-worker-1' }).workerId).toBe(
      'opportunity-worker-1'
    );
    expect(
      opportunityIngestionWorkerCompleteRequestSchema.parse({
        workerId: 'opportunity-worker-1',
        sourceCount: 4,
        sectionStatuses: preparedOpportunityIngestionResponse.request.sectionStatuses
      }).sourceCount
    ).toBe(4);
    expect(
      opportunityIngestionWorkerFailRequestSchema.parse({ workerId: 'opportunity-worker-1', reason: 'Official feed unavailable.' }).reason
    ).toContain('Official');
    const workerResponse = {
      request: {
        ...preparedOpportunityIngestionResponse.request,
        corporationId: '917701062',
        focus: processedBrief.focus
      }
    };
    expect(opportunityIngestionWorkerResponseSchema.parse(workerResponse).request.focus).toBe(processedBrief.focus);
    expect(opportunityIngestionWorkerListResponseSchema.parse({ requests: [workerResponse.request] }).requests[0].status).toBe('queued');
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
