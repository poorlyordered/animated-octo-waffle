import {
  createProductionEvidenceRequestSchema,
  productionEvidenceListResponseSchema,
  productionEvidenceRecordResponseSchema
} from '@gryyk/contracts';
import { productionEvidenceListResponse, productionEvidenceRecord } from '../fixtures/productionEvidence';

describe('Production Evidence API contract', () => {
  it('accepts value-free production evidence list responses', () => {
    const parsed = productionEvidenceListResponseSchema.parse(productionEvidenceListResponse);
    const serialized = JSON.stringify(parsed);

    expect(parsed.records[0].decision).toBe('controlled_staging');
    expect(parsed.records[0].checks.map((check) => check.key)).toContain('worker_secrets');
    expect(serialized).not.toContain('refreshToken');
    expect(serialized).not.toContain('accessToken');
    expect(serialized).not.toContain('client_secret');
  });

  it('accepts value-free mutation responses', () => {
    const parsed = productionEvidenceRecordResponseSchema.parse({ record: productionEvidenceRecord });

    expect(parsed.record.recordedBy).toBe('session:Ari Voss');
    expect(parsed.record.boundary).toContain('value-free');
  });

  it('accepts create requests and rejects invalid commit identifiers', () => {
    expect(
      createProductionEvidenceRequestSchema.parse({
        environment: 'production',
        decision: 'go',
        commitSha: 'abcdef1',
        checks: [
          {
            key: 'validation',
            status: 'verified',
            evidence: 'Validation passed without storing logs.'
          }
        ]
      }).commitSha
    ).toBe('abcdef1');

    expect(() =>
      createProductionEvidenceRequestSchema.parse({
        environment: 'production',
        decision: 'go',
        commitSha: 'not a sha',
        checks: [
          {
            key: 'validation',
            status: 'verified',
            evidence: 'Validation passed.'
          }
        ]
      })
    ).toThrow();
  });

  it('rejects unmodeled create request fields', () => {
    expect(() =>
      createProductionEvidenceRequestSchema.parse({
        environment: 'production',
        decision: 'go',
        commitSha: 'abcdef1',
        refreshToken: 'unsafe',
        checks: [
          {
            key: 'validation',
            status: 'verified',
            evidence: 'Validation passed.'
          }
        ]
      })
    ).toThrow();
  });
});
