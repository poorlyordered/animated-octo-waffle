import { OperationsHealthPanel } from '../features/operations-health/components/OperationsHealthPanel';
import { useOperationsHealth } from '../features/operations-health/state/useOperationsHealth';

export function OperationsHealthRoute() {
  const operationsHealth = useOperationsHealth();

  return <OperationsHealthPanel error={operationsHealth.error} health={operationsHealth.health} loading={operationsHealth.loading} />;
}
