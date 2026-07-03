import { IntelligenceRefreshPanel } from '../features/intelligence-refresh/components/IntelligenceRefreshPanel';
import { useIntelligenceRefresh } from '../features/intelligence-refresh/state/useIntelligenceRefresh';

export function IntelligenceRefreshRoute() {
  const intelligenceRefresh = useIntelligenceRefresh();

  return (
    <IntelligenceRefreshPanel
      error={intelligenceRefresh.error}
      loading={intelligenceRefresh.loading}
      readiness={intelligenceRefresh.readiness}
      runs={intelligenceRefresh.runs}
      selectedRun={intelligenceRefresh.selectedRun}
      onCreateRun={intelligenceRefresh.createRun}
      onLoadRun={intelligenceRefresh.loadRun}
      onRefresh={intelligenceRefresh.refresh}
      onRetryStep={intelligenceRefresh.retryStep}
      onSkipStep={intelligenceRefresh.skipStep}
    />
  );
}
