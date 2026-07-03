import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { isProductionRuntime } from './env';

export const sessionCookieName = 'gryyk_eve_session';
export const ssoStateCookieName = 'gryyk_eve_sso_state';

export interface CookieOptions {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

export interface CookieRequest {
  headers?: Record<string, string | undefined>;
}

export function readSessionSecret(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.EVE_SESSION_SECRET ?? env.GRYYK_SESSION_SECRET;

  if (configured) {
    return configured;
  }

  if (isProductionRuntime(env)) {
    throw new Error('EVE_SESSION_SECRET is required');
  }

  return 'local-development-session-secret';
}

export function shouldUseSecureCookies(
  event?: CookieRequest,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (isProductionRuntime(env)) {
    return true;
  }

  const forwardedProto = event?.headers?.['x-forwarded-proto'] ?? event?.headers?.['X-Forwarded-Proto'];
  if (forwardedProto?.split(',').some((value) => value.trim().toLowerCase() === 'https')) {
    return true;
  }

  const siteUrl = env.URL ?? env.DEPLOY_URL;
  return Boolean(siteUrl?.startsWith('https://'));
}

export function randomState(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}

export function createSignedCookieValue(payload: unknown, secret: string): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function readSignedCookieValue<T>(value: string | undefined, secret: string): T | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature, extra] = value.split('.');
  if (!encodedPayload || !signature || extra !== undefined) {
    return null;
  }

  const expectedSignature = sign(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, segment) => {
    const [rawName, ...rawValue] = segment.trim().split('=');
    if (!rawName || rawValue.length === 0) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

export function readCookie(
  headers: Record<string, string | undefined> | undefined,
  cookieName: string
): string | undefined {
  const cookieHeader = headers?.cookie ?? headers?.Cookie;
  return parseCookies(cookieHeader)[cookieName];
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  const path = options.path ?? '/';
  parts.push(`Path=${path}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.httpOnly ?? true) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  return parts.join('; ');
}

export function clearCookie(name: string): string {
  return serializeCookie(name, '', { maxAge: 0 });
}

export function isExpired(expiresAt: string, now = new Date()): boolean {
  const expires = Date.parse(expiresAt);
  return Number.isNaN(expires) || expires <= now.getTime();
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
