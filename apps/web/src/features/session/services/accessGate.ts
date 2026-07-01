import type { SessionStateResponse } from '@gryyk/contracts';

export type SessionAccessGateState = 'loading' | 'login' | 'command' | 'unauthorized' | 'unavailable';

interface SessionAccessGateInput {
  error: string | null;
  isLoading: boolean;
  session: SessionStateResponse | null;
}

export function sessionAccessGateState({ error, isLoading, session }: SessionAccessGateInput): SessionAccessGateState {
  if (isLoading) {
    return 'loading';
  }

  if (error) {
    return 'unavailable';
  }

  if (session?.signedIn && session.scopeSource === 'session') {
    return 'command';
  }

  if (session?.scopeSource === 'unauthorized') {
    return 'unauthorized';
  }

  return 'login';
}
