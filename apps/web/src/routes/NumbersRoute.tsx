import { NumbersPanel } from '../features/numbers/components/NumbersPanel';
import { useNumbersSnapshot } from '../features/numbers/state/useNumbersSnapshot';

export function NumbersRoute() {
  const numbers = useNumbersSnapshot();

  return <NumbersPanel {...numbers} onCreateDecision={numbers.createDecision} onCreateQueue={numbers.createQueue} />;
}
