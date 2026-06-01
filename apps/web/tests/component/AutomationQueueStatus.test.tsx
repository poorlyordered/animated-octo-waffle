import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutomationQueueDetail } from '../../src/features/automation-queue/components/AutomationQueueDetail';
import { AutomationQueueList } from '../../src/features/automation-queue/components/AutomationQueueList';
import { completedItem, failedItem, queuedItem } from '../fixtures/automationQueue';

describe('Automation queue status components', () => {
  it('renders queue list and supports selection and filtering', () => {
    const onSelect = vi.fn();
    const onStatusFilterChange = vi.fn();

    render(
      <AutomationQueueList
        queueItems={[queuedItem, failedItem]}
        selectedQueueItemId={queuedItem.id}
        statusFilter="all"
        onSelect={onSelect}
        onStatusFilterChange={onStatusFilterChange}
      />
    );

    fireEvent.click(screen.getByText(failedItem.taskIntent));
    fireEvent.change(screen.getByLabelText('Status filter'), { target: { value: 'failed' } });

    expect(onSelect).toHaveBeenCalledWith(failedItem);
    expect(onStatusFilterChange).toHaveBeenCalledWith('failed');
  });

  it('renders failure, retry, and no-execution detail state', () => {
    render(<AutomationQueueDetail queueItem={failedItem} />);

    expect(screen.getByText('External worker was unavailable.')).toBeInTheDocument();
    expect(screen.getByText('Eligible for future retry.')).toBeInTheDocument();
    expect(screen.getByText('Queued work is not execution. This view does not retry, dispatch, or perform EVE actions.')).toBeInTheDocument();
  });

  it('renders completed output metadata', () => {
    render(<AutomationQueueDetail queueItem={completedItem} />);

    expect(screen.getByText('Scouting plan completed.')).toBeInTheDocument();
  });
});
