import { useEffect, useState } from 'react';
import type { SessionStateResponse } from '@gryyk/contracts';
import { fetchSessionState, signOutSession } from '../services/sessionClient';

interface SessionState {
  error: string | null;
  isLoading: boolean;
  session: SessionStateResponse | null;
  signOut: () => Promise<void>;
}

export function useSessionState(): SessionState {
  const [session, setSession] = useState<SessionStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchSessionState()
      .then((nextSession) => {
        if (!cancelled) {
          setSession(nextSession);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unable to load session state');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    setError(null);
    const nextSession = await signOutSession();
    setSession(nextSession);
  }

  return { error, isLoading, session, signOut };
}
