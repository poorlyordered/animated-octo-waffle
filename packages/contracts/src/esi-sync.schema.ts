import { z } from 'zod';
import { retryRequestSummarySchema } from './retry.schema.js';

export const esiSyncDomainSchema = z.enum(['numbers', 'people', 'opportunity']);
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

export const esiSyncWorkerResultSummarySchema = z.object({
  snapshotId: z.string().min(1).optional(),
  sourceCount: z.number().int().nonnegative(),
  summary: z.string().min(1),
  sectionStatuses: z.array(
    z.object({
      key: z.string().min(1),
      status: z.string().min(1)
    })
  ),
  failures: z.array(z.string())
});

export const esiSyncWorkerFailureSummarySchema = z.object({
  reason: z.string().min(1),
  failedAt: z.string().datetime()
});

export const esiSyncSectionStatusSummarySchema = z.object({
  key: z.string().min(1),
  status: z.string().min(1)
});

export const esiSyncHistoryItemSchema = z.object({
  id: z.string().min(1),
  domain: esiSyncDomainSchema,
  status: esiSyncRequestStatusSchema,
  requestedAt: z.string().datetime(),
  claimedBy: z.string().optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  snapshotId: z.string().min(1).optional(),
  sourceCount: z.number().int().nonnegative().optional(),
  sectionStatuses: z.array(esiSyncSectionStatusSummarySchema),
  failure: esiSyncWorkerFailureSummarySchema.optional(),
  retry: retryRequestSummarySchema.optional(),
  retryHistory: z.array(retryRequestSummarySchema).optional(),
  boundary: z.string().min(1)
});

export const esiSyncStatusResponseSchema = z.object({
  vault: esiVaultSummarySchema,
  domains: z.array(esiSyncDomainSummarySchema),
  history: z.array(esiSyncHistoryItemSchema).optional()
});

export const esiSyncWorkerRequestSummarySchema = z.object({
  id: z.string().min(1),
  corporationId: z.string().min(1),
  domain: esiSyncDomainSchema,
  status: esiSyncRequestStatusSchema,
  requiredScopes: z.array(z.string().min(1)),
  requestedAt: z.string().datetime(),
  claimedBy: z.string().optional(),
  claimedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  result: esiSyncWorkerResultSummarySchema.optional(),
  failure: esiSyncWorkerFailureSummarySchema.optional()
});

export const esiSyncWorkerListResponseSchema = z.object({
  syncRequests: z.array(esiSyncWorkerRequestSummarySchema)
});

export const esiSyncWorkerRequestResponseSchema = z.object({
  syncRequest: esiSyncWorkerRequestSummarySchema
});

export const esiSyncWorkerClaimRequestSchema = z.object({
  workerId: z.string().min(1)
});

export const esiSyncWorkerRunRequestSchema = z.object({
  workerId: z.string().min(1)
});

export const esiSyncWorkerFailRequestSchema = z.object({
  workerId: z.string().min(1),
  reason: z.string().min(1)
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
