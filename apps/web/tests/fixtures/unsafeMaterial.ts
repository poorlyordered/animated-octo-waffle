export const unsafeRefreshPayloads = [
  { accessToken: 'token-value' },
  { refreshToken: 'token-value' },
  { sealed: 'sealed-token-material' },
  { clientSecret: 'client-secret' },
  { authorization: 'Bearer eyJunsafe' },
  { dispatchTarget: 'worker://run-now' },
  { retrySchedule: { executeAt: 'now' } },
  { walletAction: 'transfer' },
  { assetAction: 'move' },
  { contractAction: 'accept' },
  { roleMutation: 'grant-director' },
  { accessMutation: 'grant' },
  { standingMutation: 'set-blue' },
  { rawEsi: { wallet: [] } },
  { rawPayload: { prompt: 'secret' } },
  { nested: { refreshToken: 'nested-token' } }
];
