import { z } from 'zod';

export const eveSessionScopeSchema = z.object({
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  corporationId: z.string().min(1),
  corporationName: z.string().min(1),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  source: z.literal('eve-sso')
});

export const eveSsoStateSchema = z.object({
  state: z.string().min(16),
  returnTo: z.string().startsWith('/'),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  purpose: z.enum(['session', 'esi-sync-consent']).optional()
});

export const signedInSessionStateResponseSchema = z.object({
  signedIn: z.literal(true),
  scopeSource: z.literal('session'),
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  corporationId: z.string().min(1),
  corporationName: z.string().min(1),
  expiresAt: z.string().datetime()
});

export const fallbackSessionStateResponseSchema = z.object({
  signedIn: z.literal(false),
  scopeSource: z.literal('fallback'),
  corporationId: z.string().min(1)
});

export const missingSessionStateResponseSchema = z.object({
  signedIn: z.literal(false),
  scopeSource: z.literal('missing')
});

export const sessionStateResponseSchema = z.discriminatedUnion('scopeSource', [
  signedInSessionStateResponseSchema,
  fallbackSessionStateResponseSchema,
  missingSessionStateResponseSchema
]);

export const scopeResolutionResultSchema = z.object({
  corporationId: z.string().min(1),
  source: z.enum(['session', 'fallback']),
  session: eveSessionScopeSchema.optional()
});
