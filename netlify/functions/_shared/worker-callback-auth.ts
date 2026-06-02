import { timingSafeEqual } from 'node:crypto';
import type { FunctionEvent } from './auth-scope';

const workerSecretHeader = 'x-worker-callback-secret';

export function assertWorkerCallbackAuthorized(event: FunctionEvent, env: NodeJS.ProcessEnv = process.env) {
  const configured = env.WORKER_CALLBACK_SECRET;
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
