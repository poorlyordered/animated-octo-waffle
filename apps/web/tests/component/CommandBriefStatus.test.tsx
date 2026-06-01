import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommandBriefPanel } from '../../src/features/command-brief/components/CommandBriefPanel';
import { failedRequest, processedBrief, processingRequest } from '../fixtures/commandBrief';

describe('CommandBriefPanel status states', () => {
  it('renders processing state', () => {
    render(
      <CommandBriefPanel
        viewModel={{
          brief: null,
          request: processingRequest,
          displayState: 'processing'
        }}
      />
    );

    expect(screen.getByText(/Research is processing/)).toBeInTheDocument();
  });

  it('renders failed state without a brief', () => {
    render(
      <CommandBriefPanel
        viewModel={{
          brief: null,
          request: failedRequest,
          displayState: 'failed'
        }}
      />
    );

    expect(screen.getByText('Research failed')).toBeInTheDocument();
    expect(screen.getByText('Processor timed out')).toBeInTheDocument();
  });

  it('renders stale state with an older brief', () => {
    render(
      <CommandBriefPanel
        viewModel={{
          brief: processedBrief,
          request: failedRequest,
          displayState: 'stale',
          staleReason: 'Processor timed out'
        }}
      />
    );

    expect(screen.getByText(/Showing older processed brief/)).toBeInTheDocument();
  });
});
