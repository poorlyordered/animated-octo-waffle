import { deriveDisplayState } from '../../src/features/command-brief/services/displayState';
import { failedRequest, processedBrief, processedRequest, processingRequest } from '../fixtures/commandBrief';

describe('deriveDisplayState', () => {
  it('returns empty when no brief or request exists', () => {
    expect(deriveDisplayState(null, null).displayState).toBe('empty');
  });

  it('returns processed when a processed brief is current', () => {
    expect(deriveDisplayState(processedBrief, processedRequest).displayState).toBe('processed');
  });

  it('returns stale when a newer request is processing', () => {
    const result = deriveDisplayState(processedBrief, processingRequest);

    expect(result.displayState).toBe('stale');
    expect(result.staleReason).toContain('processing');
  });

  it('returns failed when the latest request failed and no brief exists', () => {
    expect(deriveDisplayState(null, failedRequest).displayState).toBe('failed');
  });
});
