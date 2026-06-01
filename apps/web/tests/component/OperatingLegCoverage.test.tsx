import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OperatingLegCoverage } from '../../src/features/command-brief/components/OperatingLegCoverage';
import { processedBrief } from '../fixtures/commandBrief';

describe('OperatingLegCoverage', () => {
  it('renders missing and present operating legs', () => {
    render(<OperatingLegCoverage coverage={processedBrief.coverage} />);

    expect(screen.getByText('Numbers')).toBeInTheDocument();
    expect(screen.getByText('Opportunity')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getAllByText('missing')).toHaveLength(2);
    expect(screen.getByText('present')).toBeInTheDocument();
  });
});
