import { createSign, generateKeyPairSync, type KeyObject } from 'node:crypto';

export interface EveTokenFixture {
  privateKey: KeyObject;
  publicJwk: JsonWebKey & { alg: string; kid: string; use: string };
}

export interface EveTokenClaims {
  aud?: string[];
  exp?: number;
  iss?: string;
  name?: string;
  scp?: string[];
  sub?: string;
}

export function createEveTokenFixture(kid = 'JWT-Signature-Key'): EveTokenFixture {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicJwk = publicKey.export({ format: 'jwk' }) as unknown as JsonWebKey & {
    alg: string;
    kid: string;
    use: string;
  };
  publicJwk.alg = 'RS256';
  publicJwk.kid = kid;
  publicJwk.use = 'sig';
  return { privateKey, publicJwk };
}

export function signEveToken(
  fixture: EveTokenFixture,
  claims: EveTokenClaims = {},
  header: Record<string, string> = {}
): string {
  const jwtHeader = {
    alg: 'RS256',
    kid: fixture.publicJwk.kid,
    ...header
  };
  const jwtClaims = {
    aud: ['client-id', 'EVE Online'],
    exp: Math.floor(Date.now() / 1000) + 600,
    iss: 'login.eveonline.com',
    name: 'Ari Voss',
    sub: 'CHARACTER:EVE:2110000001',
    ...claims
  };
  const data = `${base64UrlJson(jwtHeader)}.${base64UrlJson(jwtClaims)}`;
  const signature = createSign('RSA-SHA256').update(data).sign(fixture.privateKey).toString('base64url');
  return `${data}.${signature}`;
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}
