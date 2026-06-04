import { CommandBriefRoute } from './routes/CommandBriefRoute';
import { OpportunityRoute } from './routes/OpportunityRoute';
import { NumbersRoute } from './routes/NumbersRoute';
import { DecisionRecordsRoute } from './routes/DecisionRecordsRoute';
import { AutomationQueueRoute } from './routes/AutomationQueueRoute';
import { PeopleRoute } from './routes/PeopleRoute';
import { EsiSyncRoute } from './routes/EsiSyncRoute';
import { SessionStatus } from './features/session/components/SessionStatus';
import './styles/app.css';

export function App() {
  return (
    <>
      <SessionStatus />
      <CommandBriefRoute />
      <OpportunityRoute />
      <NumbersRoute />
      <DecisionRecordsRoute />
      <AutomationQueueRoute />
      <PeopleRoute />
      <EsiSyncRoute />
    </>
  );
}
