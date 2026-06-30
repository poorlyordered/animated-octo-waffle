import { assertWorkerCallbackAuthorized } from '../../../../netlify/functions/_shared/worker-callback-auth';

describe('worker callback authorization', () => {
  it('accepts the configured worker callback secret', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'worker-secret' } },
        'worker_handoff',
        { WORKER_CALLBACK_SECRET: 'worker-secret' }
      )
    ).not.toThrow();
  });

  it('rejects missing or incorrect worker callback secrets', () => {
    expect(() => assertWorkerCallbackAuthorized({ headers: {} }, 'worker_handoff', { WORKER_CALLBACK_SECRET: 'worker-secret' })).toThrow(
      'Worker callback is not authorized'
    );
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'wrong-secret' } },
        'worker_handoff',
        { WORKER_CALLBACK_SECRET: 'worker-secret' }
      )
    ).toThrow('Worker callback is not authorized');
  });

  it('rejects requests when no server-side worker callback secret is configured', () => {
    expect(() =>
      assertWorkerCallbackAuthorized({ headers: { 'x-worker-callback-secret': 'worker-secret' } }, 'worker_handoff', {})
    ).toThrow('Worker callback is not authorized');
  });

  it('accepts class-specific worker callback secrets', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'people-secret' } },
        'people_ingestion',
        {
          WORKER_CALLBACK_SECRET: 'shared-secret',
          PEOPLE_INGESTION_WORKER_CALLBACK_SECRET: 'people-secret'
        }
      )
    ).not.toThrow();
  });

  it('rejects another worker class secret when a class-specific secret is configured', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'opportunity-secret' } },
        'people_ingestion',
        {
          WORKER_CALLBACK_SECRET: 'shared-secret',
          PEOPLE_INGESTION_WORKER_CALLBACK_SECRET: 'people-secret',
          OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET: 'opportunity-secret'
        }
      )
    ).toThrow('Worker callback is not authorized');
  });

  it('falls back to the shared secret when no class-specific secret is configured', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'shared-secret' } },
        'opportunity_ingestion',
        { WORKER_CALLBACK_SECRET: 'shared-secret' }
      )
    ).not.toThrow();
  });

  it('requires the class-specific secret instead of shared fallback once configured', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'shared-secret' } },
        'esi_sync',
        {
          WORKER_CALLBACK_SECRET: 'shared-secret',
          ESI_SYNC_WORKER_CALLBACK_SECRET: 'esi-secret'
        }
      )
    ).toThrow('Worker callback is not authorized');
  });
});
