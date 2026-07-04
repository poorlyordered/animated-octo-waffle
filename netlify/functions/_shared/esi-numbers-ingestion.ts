import type { Db } from 'mongodb';
import type { NumbersSectionKey, NumbersSectionStatus } from '../../../packages/contracts/src/index';
import { createNumbersSnapshot } from './numbers-store';
import { findActiveVaultById } from './esi-token-vault-store';
import { missingScopes, requiredScopesForDomain } from './esi-token-vault';
import type { EsiSyncRequestDocument } from './esi-sync-request-store';
import type { NumbersDocument } from './numbers-normalizer';
import { createEsiWorkerAdapter, type EsiWorkerEndpointResult } from './esi-worker-adapter';

type Fetch = typeof fetch;

export async function ingestNumbersFromEsiSyncRequest(
  db: Db,
  syncRequest: EsiSyncRequestDocument,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: Fetch = fetch
) {
  if (syncRequest.domain !== 'numbers') {
    throw new Error('Only Numbers ESI sync requests can be ingested');
  }

  const vault = await findActiveVaultById(db, syncRequest.corporationId, syncRequest.vaultId);
  if (!vault) {
    throw new Error('Active ESI token vault not found');
  }

  const missing = missingScopes(vault.grantedScopes, requiredScopesForDomain('numbers'));
  if (missing.length > 0) {
    throw new Error(`ESI token vault is missing required scopes: ${missing.join(', ')}`);
  }

  const adapter = await createEsiWorkerAdapter({ db, corporationId: syncRequest.corporationId, vaultId: syncRequest.vaultId, vault, env, fetchImpl });
  const corporationId = encodeURIComponent(syncRequest.corporationId);
  const endpoints = await Promise.all([
    adapter.readEndpoint({
      label: 'Wallet divisions',
      sourceId: 'esi:wallet-divisions',
      path: `/corporations/${corporationId}/wallets/`
    }),
    adapter.readEndpoint({
      label: 'Corporation assets',
      sourceId: 'esi:corporation-assets',
      path: `/corporations/${corporationId}/assets/`,
      paginated: true,
      maxPages: 25
    }),
    adapter.readEndpoint({
      label: 'Industry jobs',
      sourceId: 'esi:industry-jobs',
      path: `/corporations/${corporationId}/industry/jobs/`,
      paginated: true,
      maxPages: 10
    }),
    adapter.readEndpoint({
      label: 'Market orders',
      sourceId: 'esi:market-orders',
      path: `/corporations/${corporationId}/orders/`,
      paginated: true,
      maxPages: 25
    })
  ]);
  const now = new Date().toISOString();
  const failures = endpoints.flatMap((endpoint) => endpoint.failure ?? []);
  const sourceReferences = endpoints.map((endpoint) => ({
    title: endpoint.label,
    url: endpoint.url,
    sourceId: endpoint.sourceId
  }));
  const document: Omit<NumbersDocument, '_id' | 'id'> = {
    corporationId: syncRequest.corporationId,
    focus: 'corporation',
    sections: {
      wallet: section('wallet', 'Wallet', walletSummary(endpoints[0].data), endpoints[0]),
      assets: section('assets', 'Assets', assetSummary(endpoints[1].data), endpoints[1]),
      logistics: section('logistics', 'Logistics', industrySummary(endpoints[2].data), endpoints[2]),
      market: section('market', 'Market', marketSummary(endpoints[3].data), endpoints[3]),
      activity: {
        key: 'activity',
        label: 'Activity',
        status: failures.length > 0 ? 'watch' : 'healthy',
        summary:
          failures.length > 0
            ? `Numbers sync completed with ${failures.length} partial ESI issue(s).`
            : 'Numbers sync completed with all configured ESI source groups.',
        metrics: [
          { label: 'Successful source groups', value: String(endpoints.filter((endpoint) => endpoint.ok).length) },
          { label: 'Failed source groups', value: String(failures.length), severity: failures.length > 0 ? 'watch' : 'info' }
        ],
        updatedAt: now
      }
    },
    observations: [
      `Processed ${endpoints.filter((endpoint) => endpoint.ok).length} read-only ESI source groups for corporation ${syncRequest.corporationId}.`
    ],
    risks: failures,
    opportunities: endpoints[3].ok ? ['Market order data is available for commander review.'] : [],
    followUps:
      failures.length > 0
        ? [
            {
              id: `esi-sync-${syncRequest.id ?? 'request'}-follow-up`,
              title: 'Review partial ESI sync coverage',
              rationale: failures.join(' '),
              suggestedPath: 'decision',
              isPlayerImpacting: false,
              relatedSection: 'activity'
            }
          ]
        : [],
    provenance: {
      sourceCount: endpoints.length,
      sourceReferences,
      confidence: failures.length > 0 ? 0.68 : 0.86,
      model: 'esi-worker',
      promptVersion: 'm13-worker-numbers-esi-ingestion',
      createdAt: now
    },
    coverage: {
      numbers: 'present',
      opportunity: endpoints[3].ok ? 'present' : 'missing',
      people: 'missing',
      missingReasons: endpoints[3].ok ? ['People data is outside this Numbers ESI sync slice.'] : ['People and market opportunity coverage are outside or unavailable in this sync.']
    },
    createdAt: now,
    updatedAt: now
  };

  const snapshot = await createNumbersSnapshot(db, document);

  return {
    snapshotId: snapshot.id,
    sourceCount: endpoints.length,
    summary: `Numbers ESI sync completed with ${snapshot.sections.length} sections.`,
    sectionStatuses: snapshot.sections.map((item) => ({ key: item.key, status: item.status })),
    failures
  };
}

function section(key: NumbersSectionKey, label: string, summary: string, endpoint: EsiWorkerEndpointResult) {
  const status: NumbersSectionStatus = endpoint.ok ? 'healthy' : 'missing';
  return {
    key,
    label,
    status,
    summary: endpoint.ok ? summary : `${label} ESI data is missing.`,
    metrics: endpoint.ok ? [{ label: `${label} records`, value: String(Array.isArray(endpoint.data) ? endpoint.data.length : 1) }] : [],
    missingReason: endpoint.ok ? undefined : endpoint.failure,
    updatedAt: new Date().toISOString()
  };
}

function walletSummary(data: unknown): string {
  const total = Array.isArray(data)
    ? data.reduce((sum, item) => sum + (typeof item === 'object' && item && typeof (item as { balance?: unknown }).balance === 'number' ? (item as { balance: number }).balance : 0), 0)
    : 0;
  return `Corporation wallet divisions reported ${Math.round(total).toLocaleString()} ISK total balance.`;
}

function assetSummary(data: unknown): string {
  return `Corporation assets returned ${Array.isArray(data) ? data.length : 0} inventory records.`;
}

function industrySummary(data: unknown): string {
  return `Corporation industry returned ${Array.isArray(data) ? data.length : 0} job records.`;
}

function marketSummary(data: unknown): string {
  return `Corporation market returned ${Array.isArray(data) ? data.length : 0} order records.`;
}
