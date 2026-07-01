import { CommandBriefRoute } from './routes/CommandBriefRoute';
import { OpportunityRoute } from './routes/OpportunityRoute';
import { NumbersRoute } from './routes/NumbersRoute';
import { DecisionRecordsRoute } from './routes/DecisionRecordsRoute';
import { AutomationQueueRoute } from './routes/AutomationQueueRoute';
import { PeopleRoute } from './routes/PeopleRoute';
import { EsiSyncRoute } from './routes/EsiSyncRoute';
import { OperationsHealthRoute } from './routes/OperationsHealthRoute';
import { ProductionEvidenceRoute } from './routes/ProductionEvidenceRoute';
import { LoginGate } from './features/session/components/LoginGate';
import { SessionStatus } from './features/session/components/SessionStatus';
import { sessionAccessGateState } from './features/session/services/accessGate';
import { useSessionState } from './features/session/state/useSessionState';
import './styles/app.css';

function CommandShell() {
  return (
    <>
      <CommandBriefRoute />
      <OpportunityRoute />
      <NumbersRoute />
      <DecisionRecordsRoute />
      <AutomationQueueRoute />
      <PeopleRoute />
      <EsiSyncRoute />
      <OperationsHealthRoute />
      <ProductionEvidenceRoute />
    </>
  );
}

export function App() {
  const sessionState = useSessionState();
  const gateState = sessionAccessGateState(sessionState);

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
  return <LoginGate error={sessionState.error} gateState={loginGateState} session={sessionState.session} signOut={sessionState.signOut} />;
}
