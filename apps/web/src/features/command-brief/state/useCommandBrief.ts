import { useEffect, useState } from 'react';
import type { CommandBriefViewModel, PrepareOpportunityIngestionResponse } from '@gryyk/contracts';
import { getCommandBrief, getResearchStatus, prepareOpportunityIngestion } from '../services/commandBriefClient';
import { deriveDisplayState } from '../services/displayState';

interface UseCommandBriefOptions {
  focus?: string;
}

interface CommandBriefState {
  error: string | null;
  requestKey: string | null;
  viewModel: CommandBriefViewModel;
}

interface UseCommandBriefState {
  loading: boolean;
  error: string | null;
  prepareOpportunityIngestion: () => Promise<PrepareOpportunityIngestionResponse>;
  viewModel: CommandBriefViewModel;
}

const emptyViewModel: CommandBriefViewModel = {
  brief: null,
  request: null,
  opportunityProvenance: null,
  displayState: 'empty'
};

export function useCommandBrief({ focus }: UseCommandBriefOptions): UseCommandBriefState {
  const [state, setState] = useState<CommandBriefState>({
    error: null,
    requestKey: null,
    viewModel: emptyViewModel
  });

  useEffect(() => {
    let active = true;
    const requestKey = focus ?? '';

    Promise.all([getCommandBrief({ focus }), getResearchStatus({ focus })])
      .then(([briefResponse, statusResponse]) => {
        if (!active) {
          return;
        }

        setState({
          error: null,
          requestKey,
          viewModel: {
            ...deriveDisplayState(briefResponse.brief, statusResponse.request),
            opportunityProvenance: briefResponse.opportunityProvenance ?? null
          }
        });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : 'Unable to load command brief.',
          requestKey,
          viewModel: emptyViewModel
        });
      });

    return () => {
      active = false;
    };
  }, [focus]);

  const currentRequestKey = focus ?? '';

  async function prepareIngestion(): Promise<PrepareOpportunityIngestionResponse> {
    const response = await prepareOpportunityIngestion(
      {
        reason: 'Refresh official news and strategic Opportunity context.'
      },
      { focus }
    );
    setState((current) => ({
      ...current,
      error: null,
      viewModel: {
        ...current.viewModel,
        opportunityProvenance: response.provenance
      }
    }));
    return response;
  }

  return {
    loading: state.requestKey !== currentRequestKey,
    error: state.error,
    prepareOpportunityIngestion: prepareIngestion,
    viewModel: state.viewModel
  };
}
