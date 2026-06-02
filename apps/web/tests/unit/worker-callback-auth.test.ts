import { assertWorkerCallbackAuthorized } from '../../../../netlify/functions/_shared/worker-callback-auth';

describe('worker callback authorization', () => {
  it('accepts the configured worker callback secret', () => {
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'worker-secret' } },
        { WORKER_CALLBACK_SECRET: 'worker-secret' }
      )
    ).not.toThrow();
  });

  it('rejects missing or incorrect worker callback secrets', () => {
    expect(() => assertWorkerCallbackAuthorized({ headers: {} }, { WORKER_CALLBACK_SECRET: 'worker-secret' })).toThrow(
      'Worker callback is not authorized'
    );
    expect(() =>
      assertWorkerCallbackAuthorized(
        { headers: { 'x-worker-callback-secret': 'wrong-secret' } },
        { WORKER_CALLBACK_SECRET: 'worker-secret' }
      )
    ).toThrow('Worker callback is not authorized');
  });

  it('rejects requests when no server-side worker callback secret is configured', () => {
    expect(() =>
      assertWorkerCallbackAuthorized({ headers: { 'x-worker-callback-secret': 'worker-secret' } }, {})
    ).toThrow('Worker callback is not authorized');
  });
});
