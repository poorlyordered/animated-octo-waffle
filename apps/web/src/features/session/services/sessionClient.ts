import type { SessionStateResponse } from '@gryyk/contracts';
import { sessionStateResponseSchema } from '@gryyk/contracts';

export async function fetchSessionState(): Promise<SessionStateResponse> {
  const response = await fetch('/api/eve-session');

  if (!response.ok) {
    throw new Error('Unable to load session state');
  }

  return sessionStateResponseSchema.parse(await response.json());
}

export async function signOutSession(): Promise<SessionStateResponse> {
  const response = await fetch('/api/eve-session/sign-out', { method: 'POST' });

  if (!response.ok) {
    throw new Error('Unable to sign out');
  }

  return sessionStateResponseSchema.parse(await response.json());
}
