import { CommandBriefRoute } from './routes/CommandBriefRoute';
import { DecisionRecordsRoute } from './routes/DecisionRecordsRoute';
import { AutomationQueueRoute } from './routes/AutomationQueueRoute';
import { PeopleRoute } from './routes/PeopleRoute';
import './styles/app.css';

export function App() {
  return (
    <>
      <CommandBriefRoute />
      <DecisionRecordsRoute />
      <AutomationQueueRoute />
      <PeopleRoute />
    </>
  );
}
