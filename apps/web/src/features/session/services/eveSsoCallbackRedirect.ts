export function rootEveSsoCallbackRedirect(pathname: string, search: string): string | null {
  if (pathname !== '/') {
    return null;
  }

  const params = new URLSearchParams(search);
  const code = params.get('code');
  const state = params.get('state');

  if (!code || !state) {
    return null;
  }

  const callbackParams = new URLSearchParams({ code, state });
  return `/api/eve-sso-callback?${callbackParams.toString()}`;
}
