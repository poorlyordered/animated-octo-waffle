import { useEffect, useState } from 'react';
import type { CommandBriefViewModel } from '@gryyk/contracts';
import { getCommandBrief, getResearchStatus } from '../services/commandBriefClient';
import { deriveDisplayState } from '../services/displayState';

interface UseCommandBriefOptions {
  corporationId: string | null;
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
  viewModel: CommandBriefViewModel;
}

const emptyViewModel: CommandBriefViewModel = {
  brief: null,
  request: null,
  displayState: 'empty'
};

export function useCommandBrief({ corporationId, focus }: UseCommandBriefOptions): UseCommandBriefState {
  const [state, setState] = useState<CommandBriefState>({
    error: null,
    requestKey: null,
    viewModel: emptyViewModel
  });

  useEffect(() => {
    if (!corporationId) {
      return;
    }

    let active = true;
    const requestKey = `${corporationId}:${focus ?? ''}`;

    Promise.all([getCommandBrief({ corporationId, focus }), getResearchStatus({ corporationId, focus })])
      .then(([briefResponse, statusResponse]) => {
        if (!active) {
          return;
        }

        setState({
          error: null,
          requestKey,
          viewModel: deriveDisplayState(briefResponse.brief, statusResponse.request)
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
  }, [corporationId, focus]);

  if (!corporationId) {
    return {
      loading: false,
      error: 'Corporation identity is unavailable.',
      viewModel: emptyViewModel
    };
  }

  const currentRequestKey = `${corporationId}:${focus ?? ''}`;

  return {
    loading: state.requestKey !== currentRequestKey,
    error: state.error,
    viewModel: state.viewModel
  };
}
