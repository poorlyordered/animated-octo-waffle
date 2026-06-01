import { CommandBriefRoute } from './routes/CommandBriefRoute';
import { DecisionRecordsRoute } from './routes/DecisionRecordsRoute';
import { AutomationQueueRoute } from './routes/AutomationQueueRoute';
import { PeopleRoute } from './routes/PeopleRoute';
import { SessionStatus } from './features/session/components/SessionStatus';
import './styles/app.css';

export function App() {
  return (
    <>
      <SessionStatus />
      <CommandBriefRoute />
      <DecisionRecordsRoute />
      <AutomationQueueRoute />
      <PeopleRoute />
    </>
  );
}
