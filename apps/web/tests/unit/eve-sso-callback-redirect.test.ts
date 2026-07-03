import { rootEveSsoCallbackRedirect } from '../../src/features/session/services/eveSsoCallbackRedirect';

describe('rootEveSsoCallbackRedirect', () => {
  it('hands root EVE SSO callback parameters to the server callback endpoint', () => {
    expect(rootEveSsoCallbackRedirect('/', '?code=callback-code&state=signed-state')).toBe(
      '/api/eve-sso-callback?code=callback-code&state=signed-state'
    );
  });

  it('preserves encoded callback values without forwarding unrelated query parameters', () => {
    expect(rootEveSsoCallbackRedirect('/', '?code=code+with+spaces&state=state%2Fvalue&ignored=value')).toBe(
      '/api/eve-sso-callback?code=code+with+spaces&state=state%2Fvalue'
    );
  });

  it('does not redirect when the root path is not an EVE SSO callback', () => {
    expect(rootEveSsoCallbackRedirect('/', '')).toBeNull();
    expect(rootEveSsoCallbackRedirect('/', '?code=callback-code')).toBeNull();
    expect(rootEveSsoCallbackRedirect('/', '?state=signed-state')).toBeNull();
  });

  it('does not redirect non-root paths', () => {
    expect(rootEveSsoCallbackRedirect('/api/eve-sso-callback', '?code=callback-code&state=signed-state')).toBeNull();
  });
});
