import type { SessionStateResponse } from '@gryyk/contracts';

interface SessionStatusProps {
  session: Extract<SessionStateResponse, { scopeSource: 'session' }>;
  signOut: () => Promise<void>;
}

export function SessionStatus({ session, signOut }: SessionStatusProps) {
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
