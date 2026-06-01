import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutomationQueueCreate } from '../../src/features/automation-queue/components/AutomationQueueCreate';
import { approvedDecision, proposedDecision } from '../fixtures/decisionRecords';
import { queuedItem } from '../fixtures/automationQueue';

describe('AutomationQueueCreate', () => {
  it('creates queued work from an approved decision', async () => {
    const onCreate = vi.fn().mockResolvedValue(queuedItem);

    render(<AutomationQueueCreate decision={approvedDecision} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText('Owner'), { target: { value: 'research-worker' } });
    fireEvent.click(screen.getByText('Queue work'));

    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      sourceDecisionId: approvedDecision.id,
      owner: 'research-worker'
    });
    expect(await screen.findByText('Queued work is not execution. No worker, EVE action, retry, or external service has run.')).toBeInTheDocument();
  });

  it('blocks queue creation for unapproved decisions in the UI', () => {
    const onCreate = vi.fn();

    render(<AutomationQueueCreate decision={proposedDecision} onCreate={onCreate} />);

    expect(screen.getByText('Only approved decisions with required approval metadata can create queued work.')).toBeInTheDocument();
    expect(screen.getByText('Queue work')).toBeDisabled();
  });
});
