import {
  clearCookie,
  createSignedCookieValue,
  isExpired,
  parseCookies,
  readSignedCookieValue,
  serializeCookie
} from '../../../../netlify/functions/_shared/session-cookie';

describe('session cookie helpers', () => {
  it('creates and verifies signed values', () => {
    const signed = createSignedCookieValue({ corporationId: '917701062' }, 'secret');

    expect(readSignedCookieValue(signed, 'secret')).toEqual({ corporationId: '917701062' });
  });

  it('rejects tampered values', () => {
    const signed = createSignedCookieValue({ corporationId: '917701062' }, 'secret');

    expect(readSignedCookieValue(`${signed}x`, 'secret')).toBeNull();
    expect(readSignedCookieValue(signed, 'wrong-secret')).toBeNull();
  });

  it('serializes and clears HTTP-only cookies', () => {
    expect(serializeCookie('scope', 'value', { maxAge: 60 })).toContain('HttpOnly');
    expect(serializeCookie('scope', 'value', { maxAge: 60 })).toContain('SameSite=Lax');
    expect(clearCookie('scope')).toContain('Max-Age=0');
  });

  it('parses cookie headers', () => {
    expect(parseCookies('first=one; second=two')).toEqual({
      first: 'one',
      second: 'two'
    });
  });

  it('detects expired timestamps', () => {
    expect(isExpired('2026-06-01T00:00:00.000Z', new Date('2026-06-01T00:00:00.001Z'))).toBe(true);
    expect(isExpired('2026-06-01T00:00:00.002Z', new Date('2026-06-01T00:00:00.001Z'))).toBe(false);
  });
});
