import { useSessionState } from '../state/useSessionState';

export function SessionStatus() {
  const { error, isLoading, session, signOut } = useSessionState();

  if (isLoading) {
    return (
      <aside className="session-status" aria-label="Command scope">
        <span>Scope loading</span>
      </aside>
    );
  }

  if (error || !session) {
    return (
      <aside className="session-status session-status-missing" aria-label="Command scope">
        <span>Scope unavailable</span>
      </aside>
    );
  }

  if (session.scopeSource === 'session') {
    return (
      <aside className="session-status" aria-label="Command scope">
        <div>
          <span>Signed in</span>
          <strong>{session.characterName}</strong>
          <small>{session.corporationName}</small>
        </div>
        <button type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </aside>
    );
  }

  if (session.scopeSource === 'fallback') {
    return (
      <aside className="session-status session-status-fallback" aria-label="Command scope">
        <div>
          <span>Local fallback scope</span>
          <strong>{session.corporationId}</strong>
        </div>
        <a href="/api/eve-sso-start">Sign in with EVE</a>
      </aside>
    );
  }

  return (
    <aside className="session-status session-status-missing" aria-label="Command scope">
      <div>
        <span>No command scope</span>
        <strong>Session required</strong>
      </div>
      <a href="/api/eve-sso-start">Sign in with EVE</a>
    </aside>
  );
}
