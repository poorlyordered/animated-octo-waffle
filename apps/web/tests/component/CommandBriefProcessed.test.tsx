import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommandBriefPanel } from '../../src/features/command-brief/components/CommandBriefPanel';
import { processedBrief, processedRequest } from '../fixtures/commandBrief';

describe('CommandBriefPanel processed state', () => {
  it('renders the processed command brief and metadata', () => {
    render(
      <CommandBriefPanel
        viewModel={{
          brief: processedBrief,
          request: processedRequest,
          displayState: 'processed'
        }}
      />
    );

    expect(screen.getByText('Corporation state')).toBeInTheDocument();
    expect(screen.getByText(processedBrief.executiveSummary)).toBeInTheDocument();
    expect(screen.getByText('google/gemma-4-31b-it')).toBeInTheDocument();
    expect(screen.getByText('official-news-brief-v1')).toBeInTheDocument();
    expect(screen.getByText('Expansion patch notes')).toBeInTheDocument();
  });
});
