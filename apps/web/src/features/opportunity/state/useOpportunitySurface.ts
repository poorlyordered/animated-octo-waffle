import { useCommandBrief } from '../../command-brief/state/useCommandBrief';
import { deriveOpportunitySurface } from '../services/opportunitySurface';

export function useOpportunitySurface(focus = 'grykk-47-eve-official-news') {
  const commandBrief = useCommandBrief({ focus });

  return {
    error: commandBrief.error,
    loading: commandBrief.loading,
    opportunity: deriveOpportunitySurface(commandBrief.viewModel),
    prepareIngestion: commandBrief.prepareOpportunityIngestion,
    sourceBrief: commandBrief.viewModel.brief
  };
}
