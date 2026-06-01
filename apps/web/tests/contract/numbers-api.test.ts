import { numbersSnapshotResponseSchema } from '@gryyk/contracts';
import { numbersSnapshot } from '../fixtures/numbers';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';

describe('Numbers API contract', () => {
  it('accepts processed numbers snapshot responses', () => {
    const parsed = numbersSnapshotResponseSchema.parse({ snapshot: numbersSnapshot });

    expect(parsed.snapshot?.sections).toHaveLength(5);
    expect(parsed.snapshot?.provenance.sourceCount).toBe(2);
  });

  it('accepts empty numbers snapshot responses', () => {
    expect(numbersSnapshotResponseSchema.parse({ snapshot: null })).toEqual({ snapshot: null });
  });

  it('keeps no-session fallback corporation scope and ignores browser inputs', () => {
    const scope = getAuthScope(
      {
        headers: { 'x-corporation-id': 'browser-corp' },
        queryStringParameters: { corporationId: 'query-corp', walletAction: 'transfer' },
        body: JSON.stringify({ corporationId: 'body-corp', executeNow: true })
      },
      { EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' }
    );

    expect(scope.corporationId).toBe('917701062');
  });

  it('does not include secrets or dispatch targets in browser-visible numbers JSON', () => {
    const body = JSON.stringify({ snapshot: numbersSnapshot });

    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('credential');
    expect(body).not.toContain('dispatchTarget');
  });
});
