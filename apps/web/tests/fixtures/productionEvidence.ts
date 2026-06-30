import type { ProductionEvidenceListResponse, ProductionEvidenceRecord } from '@gryyk/contracts';

export const productionEvidenceRecord: ProductionEvidenceRecord = {
  id: 'evidence-1',
  corporationId: '917701062',
  environment: 'production',
  decision: 'controlled_staging',
  commitSha: '2ef99121736872df8e6393a6dbf3c2dda62140c4',
  pullRequestUrl: 'https://github.com/example/gryyk-47-greenfield/pull/46',
  deployId: 'netlify-deploy-20260630',
  rollbackTarget: 'netlify-deploy-previous',
  checks: [
    {
      key: 'validation',
      status: 'verified',
      evidence: 'Build, typecheck, lint, Jest, and e2e passed.'
    },
    {
      key: 'worker_secrets',
      status: 'attention',
      evidence: 'Secret state labels reviewed without exposing values.'
    }
  ],
  recordedBy: 'session:Ari Voss',
  recordedAt: '2026-06-30T23:00:00.000Z',
  boundary:
    'Production evidence records are value-free. They store deployment posture, validation status, and operator attribution only; they do not store secrets, tokens, cookies, JWTs, connection strings, or production record exports.'
};

export const productionEvidenceListResponse: ProductionEvidenceListResponse = {
  records: [productionEvidenceRecord],
  boundary: productionEvidenceRecord.boundary
};
