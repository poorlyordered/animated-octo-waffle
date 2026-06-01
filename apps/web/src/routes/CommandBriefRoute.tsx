import { defaultResearchFocus } from '@gryyk/contracts';
import { CommandBriefPanel } from '../features/command-brief/components/CommandBriefPanel';
import { useCommandBrief } from '../features/command-brief/state/useCommandBrief';

export function CommandBriefRoute() {
  const commandBrief = useCommandBrief({
    focus: defaultResearchFocus
  });

  return <CommandBriefPanel {...commandBrief} />;
}
