import type { SessionStateResponse } from '@gryyk/contracts';
import type { SessionAccessGateState } from '../services/accessGate';

interface LoginGateProps {
  error: string | null;
  gateState: Exclude<SessionAccessGateState, 'command'>;
  session: SessionStateResponse | null;
  signOut: () => Promise<void>;
}

const capabilityCues = [
  {
    title: 'Command Brief',
    text: 'Current corporation context, provenance, confidence, and watchlist.'
  },
  {
    title: 'Numbers',
    text: 'Wallet, assets, logistics, market, activity, and missing data posture.'
  },
  {
    title: 'Opportunity',
    text: 'Official-news intelligence, strategic impacts, and decision handoffs.'
  },
  {
    title: 'People',
    text: 'Member health, roles, delegation, onboarding, and leadership follow-ups.'
  }
];

export function LoginGate({ error, gateState, session, signOut }: LoginGateProps) {
  const isUnauthorized = gateState === 'unauthorized' && session?.scopeSource === 'unauthorized';
  const isUnavailable = gateState === 'unavailable';
  const isLoading = gateState === 'loading';

  return (
    <main className="login-gate" aria-label="Gryyk-47 access gate">
      <section className="login-gate-hero">
        <p className="eyebrow">Corporation command access</p>
        <h1>Gryyk-47</h1>
        <p className="login-gate-subtitle">EVE Online corporation command operating system</p>
        <p className="login-gate-copy">
          Sign in with EVE Online SSO to inspect corporation intelligence, decision records, queued work, and operational evidence.
        </p>

        <div className="login-gate-actions" aria-label="Access actions">
          {isLoading ? (
            <span className="login-gate-status">Checking command session...</span>
          ) : isUnauthorized ? (
            <>
              <span className="login-gate-status login-gate-status-warning">
                {session.corporationName} is not authorized for this command scope.
              </span>
              <button type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          ) : isUnavailable ? (
            <>
              <span className="login-gate-status login-gate-status-warning">{error ?? 'Session state is unavailable.'}</span>
              <a className="eve-login-button" href="/api/eve-sso-start">
                Sign in with EVE Online
              </a>
            </>
          ) : (
            <a className="eve-login-button" href="/api/eve-sso-start">
              Sign in with EVE Online
            </a>
          )}
        </div>

        <p className="login-gate-trust">Gryyk-47 uses EVE SSO for authentication and does not store EVE account passwords.</p>
      </section>

      <section className="login-gate-cues" aria-label="Protected command surfaces">
        {capabilityCues.map((cue) => (
          <article className="login-gate-cue" key={cue.title}>
            <h2>{cue.title}</h2>
            <p>{cue.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
