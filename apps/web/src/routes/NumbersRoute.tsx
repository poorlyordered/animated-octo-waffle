import { NumbersPanel } from '../features/numbers/components/NumbersPanel';
import { useNumbersSnapshot } from '../features/numbers/state/useNumbersSnapshot';

export function NumbersRoute() {
  const numbers = useNumbersSnapshot();

  return (
    <NumbersPanel
      {...numbers}
      onCreateDecision={numbers.createDecision}
      onUpdateDecisionStatus={numbers.updateDecisionStatus}
      onCreateQueue={numbers.createQueue}
    />
  );
}
