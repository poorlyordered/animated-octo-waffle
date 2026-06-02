import { z } from 'zod';

export const esiSyncDomainSchema = z.enum(['numbers']);
export const esiVaultStatusSchema = z.enum(['missing', 'active', 'revoked', 'unavailable']);
export const esiSyncRequestStatusSchema = z.enum(['queued', 'claimed', 'completed', 'failed', 'cancelled']);

export const esiIdentitySummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1)
});

export const esiSyncLastSyncSummarySchema = z.object({
  id: z.string().min(1),
  domain: esiSyncDomainSchema,
  status: esiSyncRequestStatusSchema,
  requestedAt: z.string().datetime()
});

export const esiVaultSummarySchema = z.object({
  status: esiVaultStatusSchema,
  character: esiIdentitySummarySchema.nullable(),
  corporation: esiIdentitySummarySchema.nullable(),
  grantedScopes: z.array(z.string()),
  requiredScopes: z.array(z.string()),
  consentedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  lastSync: esiSyncLastSyncSummarySchema.nullable(),
  boundaries: z.array(z.string().min(1))
});

export const esiSyncDomainSummarySchema = z.object({
  domain: esiSyncDomainSchema,
  label: z.string().min(1),
  requiredScopes: z.array(z.string().min(1)),
  available: z.boolean(),
  missingScopes: z.array(z.string().min(1))
});

export const esiSyncStatusResponseSchema = z.object({
  vault: esiVaultSummarySchema,
  domains: z.array(esiSyncDomainSummarySchema)
});

export const startEsiSyncConsentRequestSchema = z.object({
  returnTo: z.string().startsWith('/').optional()
});

export const startEsiSyncConsentResponseSchema = z.object({
  authorizationUrl: z.string().url(),
  requestedScopes: z.array(z.string().min(1)),
  stateExpiresAt: z.string().datetime(),
  boundary: z.string().min(1)
});

export const revokeEsiVaultRequestSchema = z.object({
  reason: z.string().min(1).optional()
});

export const revokeEsiVaultResponseSchema = z.object({
  vault: esiVaultSummarySchema
});

export const prepareEsiSyncRequestSchema = z.object({
  domain: esiSyncDomainSchema
});

export const esiSyncRequestSummarySchema = z.object({
  id: z.string().min(1),
  domain: esiSyncDomainSchema,
  status: z.literal('queued'),
  requiredScopes: z.array(z.string().min(1)),
  requestedAt: z.string().datetime(),
  boundary: z.string().min(1)
});

export const prepareEsiSyncResponseSchema = z.object({
  syncRequest: esiSyncRequestSummarySchema,
  duplicate: z.boolean()
});

export const esiSyncBlockedResponseSchema = z.object({
  error: z.enum(['missing_consent', 'missing_scope', 'revoked_vault', 'unsafe_request']),
  message: z.string().min(1),
  missingScopes: z.array(z.string().min(1)).optional(),
  boundary: z.string().min(1)
});
