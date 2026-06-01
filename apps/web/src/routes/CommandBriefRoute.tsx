import { defaultResearchFocus } from '@gryyk/contracts';
import { CommandBriefPanel } from '../features/command-brief/components/CommandBriefPanel';
import { useDecisionRecords } from '../features/decision-records/state/useDecisionRecords';
import { useCommandBrief } from '../features/command-brief/state/useCommandBrief';

export function CommandBriefRoute() {
  const commandBrief = useCommandBrief({
    focus: defaultResearchFocus
  });
  const decisionRecords = useDecisionRecords();

  return <CommandBriefPanel {...commandBrief} onCreateDecision={decisionRecords.createDecision} />;
}
