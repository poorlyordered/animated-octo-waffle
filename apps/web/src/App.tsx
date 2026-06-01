import { CommandBriefRoute } from './routes/CommandBriefRoute';
import { NumbersRoute } from './routes/NumbersRoute';
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
      <NumbersRoute />
      <DecisionRecordsRoute />
      <AutomationQueueRoute />
      <PeopleRoute />
    </>
  );
}
