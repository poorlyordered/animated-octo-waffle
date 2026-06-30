import { deriveOverallStatus, summarizeWorkerReadiness } from '../../../../netlify/functions/_shared/operations-health';

describe('operations health summaries', () => {
  it('summarizes class-specific worker secrets without exposing values', () => {
    const readiness = summarizeWorkerReadiness({
      WORKER_CALLBACK_SECRET: 'shared-secret',
      WORKER_HANDOFF_CALLBACK_SECRET: 'handoff-secret'
    });

    expect(readiness.find((worker) => worker.workerClass === 'worker_handoff')).toMatchObject({
      secretState: 'configured',
      status: 'ready'
    });
    expect(readiness.find((worker) => worker.workerClass === 'retry_worker')).toMatchObject({
      secretState: 'fallback',
      status: 'degraded'
    });
    expect(JSON.stringify(readiness)).not.toContain('shared-secret');
    expect(JSON.stringify(readiness)).not.toContain('handoff-secret');
  });

  it('marks overall health blocked when a critical warning is present', () => {
    expect(
      deriveOverallStatus(
        [],
        [],
        [],
        [
          {
            key: 'test_identity_configured',
            severity: 'critical',
            message: 'Test identity is configured.'
          }
        ]
      )
    ).toBe('blocked');
  });
});
