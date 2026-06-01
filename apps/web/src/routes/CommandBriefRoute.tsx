import { defaultResearchFocus } from '@gryyk/contracts';
import { CommandBriefPanel } from '../features/command-brief/components/CommandBriefPanel';
import { useCommandBrief } from '../features/command-brief/state/useCommandBrief';

interface CommandBriefRouteProps {
  corporationId: string | null;
}

export function CommandBriefRoute({ corporationId }: CommandBriefRouteProps) {
  const commandBrief = useCommandBrief({
    corporationId,
    focus: defaultResearchFocus
  });

  return <CommandBriefPanel {...commandBrief} />;
}
