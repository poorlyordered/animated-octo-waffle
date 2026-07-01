import type { SessionStateResponse } from '@gryyk/contracts';
import { sessionAccessGateState } from '../../src/features/session/services/accessGate';

const signedSession: SessionStateResponse = {
  signedIn: true,
  scopeSource: 'session',
  characterId: '2110000001',
  characterName: 'Ari Voss',
  corporationId: '917701062',
  corporationName: 'Gryyk-47',
  expiresAt: '2099-06-01T00:00:00.000Z'
};

describe('sessionAccessGateState', () => {
  it('shows loading while session state is loading', () => {
    expect(sessionAccessGateState({ error: null, isLoading: true, session: null })).toBe('loading');
  });

  it('allows the command shell only for signed session state', () => {
    expect(sessionAccessGateState({ error: null, isLoading: false, session: signedSession })).toBe('command');
  });

  it('shows the login gate for fallback, missing, and absent sessions', () => {
    expect(
      sessionAccessGateState({
        error: null,
        isLoading: false,
        session: { signedIn: false, scopeSource: 'fallback', corporationId: '917701062' }
      })
    ).toBe('login');
    expect(sessionAccessGateState({ error: null, isLoading: false, session: { signedIn: false, scopeSource: 'missing' } })).toBe(
      'login'
    );
    expect(sessionAccessGateState({ error: null, isLoading: false, session: null })).toBe('login');
  });

  it('shows unauthorized state for mismatched corporation sessions', () => {
    expect(
      sessionAccessGateState({
        error: null,
        isLoading: false,
        session: {
          signedIn: false,
          scopeSource: 'unauthorized',
          characterId: '2110000001',
          characterName: 'Ari Voss',
          corporationId: '123456789',
          corporationName: 'Other Corp',
          reason: 'Signed EVE session is not authorized for this corporation'
        }
      })
    ).toBe('unauthorized');
  });

  it('shows unavailable state when the session endpoint fails', () => {
    expect(sessionAccessGateState({ error: 'Unable to load session state', isLoading: false, session: null })).toBe('unavailable');
  });
});
