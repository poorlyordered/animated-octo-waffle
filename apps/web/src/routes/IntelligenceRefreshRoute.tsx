import { IntelligenceRefreshPanel } from '../features/intelligence-refresh/components/IntelligenceRefreshPanel';
import { useIntelligenceRefresh } from '../features/intelligence-refresh/state/useIntelligenceRefresh';

export function IntelligenceRefreshRoute() {
  const intelligenceRefresh = useIntelligenceRefresh();

  return (
    <IntelligenceRefreshPanel
      error={intelligenceRefresh.error}
      loading={intelligenceRefresh.loading}
      runs={intelligenceRefresh.runs}
      onCreateRun={intelligenceRefresh.createRun}
      onRefresh={intelligenceRefresh.refresh}
    />
  );
}
