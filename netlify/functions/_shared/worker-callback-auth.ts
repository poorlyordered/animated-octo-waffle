import { timingSafeEqual } from 'node:crypto';
import type { FunctionEvent } from './auth-scope';

const workerSecretHeader = 'x-worker-callback-secret';

export type WorkerCallbackClass =
  | 'worker_handoff'
  | 'retry_worker'
  | 'esi_sync'
  | 'people_ingestion'
  | 'opportunity_ingestion'
  | 'brain_worker';

const workerClassSecretEnv: Record<WorkerCallbackClass, string> = {
  worker_handoff: 'WORKER_HANDOFF_CALLBACK_SECRET',
  retry_worker: 'RETRY_WORKER_CALLBACK_SECRET',
  esi_sync: 'ESI_SYNC_WORKER_CALLBACK_SECRET',
  people_ingestion: 'PEOPLE_INGESTION_WORKER_CALLBACK_SECRET',
  opportunity_ingestion: 'OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET',
  brain_worker: 'BRAIN_WORKER_CALLBACK_SECRET'
};

export function assertWorkerCallbackAuthorized(
  event: FunctionEvent,
  workerClass: WorkerCallbackClass = 'worker_handoff',
  env: NodeJS.ProcessEnv = process.env
) {
  const configured = env[workerClassSecretEnv[workerClass]] ?? env.WORKER_CALLBACK_SECRET;
  const provided = readHeader(event.headers, workerSecretHeader);

  if (!configured || !provided || !safeEqual(configured, provided)) {
    throw new Error('Worker callback is not authorized');
  }
}

function readHeader(headers: Record<string, string | undefined> | undefined, name: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  return match?.[1];
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
