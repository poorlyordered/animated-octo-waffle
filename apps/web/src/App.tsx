import { CommandShell } from './features/command-shell/components/CommandShell';
import { LoginGate } from './features/session/components/LoginGate';
import { SessionStatus } from './features/session/components/SessionStatus';
import { sessionAccessGateState } from './features/session/services/accessGate';
import { rootEveSsoCallbackRedirect } from './features/session/services/eveSsoCallbackRedirect';
import { useSessionState } from './features/session/state/useSessionState';
import './styles/app.css';

export function App() {
  const callbackRedirect =
    typeof window === 'undefined' ? null : rootEveSsoCallbackRedirect(window.location.pathname, window.location.search);

  if (callbackRedirect) {
    window.location.replace(callbackRedirect);
    return (
      <main className="login-gate" aria-label="Gryyk-47 access gate">
        <section className="login-gate-hero">
          <p className="eyebrow">Corporation command access</p>
          <h1>Gryyk-47</h1>
          <p className="login-gate-subtitle">Completing EVE SSO sign-in...</p>
        </section>
      </main>
    );
  }

  return <SessionApp />;
}

function SessionApp() {
  const sessionState = useSessionState();
  const gateState = sessionAccessGateState(sessionState);
  const authCallbackError =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('auth_error');
  const displayError =
    authCallbackError === 'invalid_sso_state'
      ? 'EVE SSO sign-in expired or could not be verified. Start sign-in again.'
      : sessionState.error;

  const session = sessionState.session;

  if (gateState === 'command' && session?.signedIn && session.scopeSource === 'session') {
    return (
      <>
        <SessionStatus session={session} signOut={sessionState.signOut} />
        <CommandShell />
      </>
    );
  }

  const loginGateState = gateState === 'command' ? 'unavailable' : gateState;
  return <LoginGate error={displayError} gateState={loginGateState} session={sessionState.session} signOut={sessionState.signOut} />;
}
