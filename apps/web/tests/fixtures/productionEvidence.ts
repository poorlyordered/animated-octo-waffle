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

export const productionEvidenceNoGoRecord: ProductionEvidenceRecord = {
  ...productionEvidenceRecord,
  id: 'evidence-2',
  environment: 'staging',
  decision: 'no_go',
  commitSha: '3ef99121736872df8e6393a6dbf3c2dda62140c4',
  pullRequestUrl: 'https://github.com/example/gryyk-47-greenfield/pull/47',
  deployId: 'netlify-deploy-20260701',
  checks: [
    {
      key: 'validation',
      status: 'blocked',
      evidence: 'Build blocked before production deploy.'
    },
    {
      key: 'rollback',
      status: 'verified',
      evidence: 'Rollback target confirmed without storing values.'
    }
  ],
  recordedBy: 'session:Mara Vale',
  recordedAt: '2026-07-01T00:00:00.000Z'
};

export const productionEvidenceGoRecord: ProductionEvidenceRecord = {
  ...productionEvidenceRecord,
  id: 'evidence-3',
  environment: 'controlled_staging',
  decision: 'go',
  commitSha: '4ef99121736872df8e6393a6dbf3c2dda62140c4',
  pullRequestUrl: 'https://github.com/example/gryyk-47-greenfield/pull/48',
  deployId: 'netlify-deploy-20260702',
  checks: [
    {
      key: 'validation',
      status: 'verified',
      evidence: 'Validation passed without logs.'
    },
    {
      key: 'monitoring',
      status: 'not_applicable',
      evidence: 'No monitoring change required.'
    }
  ],
  recordedBy: 'command-scope:917701062',
  recordedAt: '2026-07-01T01:00:00.000Z'
};

export const productionEvidenceListResponse: ProductionEvidenceListResponse = {
  records: [productionEvidenceRecord, productionEvidenceNoGoRecord, productionEvidenceGoRecord],
  boundary: productionEvidenceRecord.boundary
};
