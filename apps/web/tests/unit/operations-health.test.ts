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
    expect(readiness.find((worker) => worker.workerClass === 'brain_worker')).toMatchObject({
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

  it('treats missing OpenRouter configuration as blocking for Brain readiness', () => {
    const brainWorker = summarizeWorkerReadiness({
      BRAIN_WORKER_CALLBACK_SECRET: 'brain-secret'
    }).find((worker) => worker.workerClass === 'brain_worker');

    expect(brainWorker).toMatchObject({
      secretState: 'configured',
      status: 'ready'
    });
    expect(
      deriveOverallStatus(
        [],
        [],
        [brainWorker!],
        [
          {
            key: 'missing_openrouter_api_key',
            severity: 'critical',
            message: 'OPENROUTER_API_KEY is not configured in this runtime; Brain worker runs are blocked.'
          }
        ]
      )
    ).toBe('blocked');
  });
});
