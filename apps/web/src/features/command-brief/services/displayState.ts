import type { CommandBrief, CommandBriefViewModel, DisplayState, ResearchRequest } from '@gryyk/contracts';

const activeStatuses = new Set(['queued', 'raw_captured', 'processing']);

function isNewer(left?: string, right?: string): boolean {
  if (!left || !right) {
    return false;
  }

  return new Date(left).getTime() > new Date(right).getTime();
}

export function deriveDisplayState(brief: CommandBrief | null, request: ResearchRequest | null): CommandBriefViewModel {
  if (!brief && !request) {
    return { brief, request, displayState: 'empty' };
  }

  if (request && activeStatuses.has(request.status)) {
    if (brief && isNewer(request.createdAt, brief.createdAt)) {
      return {
        brief,
        request,
        displayState: 'stale',
        staleReason: 'A newer research pull is still processing.'
      };
    }

    return { brief, request, displayState: 'processing' };
  }

  if (request?.status === 'failed') {
    if (brief && isNewer(request.createdAt, brief.createdAt)) {
      return {
        brief,
        request,
        displayState: 'stale',
        staleReason: request.errorMessage ?? 'A newer research pull failed.'
      };
    }

    return { brief, request, displayState: brief ? 'processed' : 'failed' };
  }

  const displayState: DisplayState = brief ? 'processed' : 'empty';
  return { brief, request, displayState };
}
