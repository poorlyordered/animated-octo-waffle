const unsafeRequestFields = new Set([
  'corporationId',
  'approval',
  'approvalText',
  'approvedAt',
  'sourceProvenance',
  'provenance',
  'sourceReferences',
  'confidence',
  'model',
  'promptVersion',
  'execute',
  'executeNow',
  'execution',
  'dispatch',
  'dispatchTarget',
  'workerId',
  'workerSecret',
  'retry',
  'retryAt',
  'walletAction',
  'assetAction',
  'eveWrite',
  'contractAction',
  'externalService'
]);

export function assertNoUnsafeNumbersFollowUpFields(value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const unsafeField = Object.keys(record).find((key) => unsafeRequestFields.has(key));

  if (unsafeField) {
    throw new Error(`Unsafe Numbers follow-up action field rejected: ${unsafeField}`);
  }
}
