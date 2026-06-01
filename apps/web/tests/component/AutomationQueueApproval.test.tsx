import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutomationQueueCreate } from '../../src/features/automation-queue/components/AutomationQueueCreate';
import { playerImpactingDecision } from '../fixtures/decisionRecords';
import { approvedPlayerImpactingDecision } from '../fixtures/automationQueue';

describe('Automation queue approval boundaries', () => {
  it('blocks player-impacting decisions without approval metadata', () => {
    render(<AutomationQueueCreate decision={{ ...playerImpactingDecision, status: 'approved' }} onCreate={vi.fn()} />);

    expect(screen.getByText('Only approved decisions with required approval metadata can create queued work.')).toBeInTheDocument();
    expect(screen.getByText('Queue work')).toBeDisabled();
  });

  it('allows player-impacting decisions with approval metadata but keeps no-execution language', () => {
    render(<AutomationQueueCreate decision={approvedPlayerImpactingDecision} onCreate={vi.fn()} />);

    expect(screen.getByText('Queue work')).not.toBeDisabled();
  });
});
