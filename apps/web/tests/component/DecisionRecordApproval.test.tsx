import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DecisionRecordDetail } from '../../src/features/decision-records/components/DecisionRecordDetail';
import { playerImpactingDecision } from '../fixtures/decisionRecords';

describe('Decision record approval boundary', () => {
  it('renders explicit approval messaging for player-impacting decisions', () => {
    render(<DecisionRecordDetail decision={playerImpactingDecision} onUpdateStatus={vi.fn()} />);

    expect(screen.getByText(/explicit approval is required/)).toBeInTheDocument();
    expect(screen.getByText(/do not execute actions/)).toBeInTheDocument();
  });
});
