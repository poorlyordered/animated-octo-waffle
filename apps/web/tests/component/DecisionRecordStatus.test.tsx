import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DecisionRecordDetail } from '../../src/features/decision-records/components/DecisionRecordDetail';
import { DecisionRecordList } from '../../src/features/decision-records/components/DecisionRecordList';
import { approvedDecision, proposedDecision } from '../fixtures/decisionRecords';

describe('Decision record status components', () => {
  it('renders decision list and supports selection', () => {
    const onSelect = vi.fn();

    render(<DecisionRecordList decisions={[proposedDecision]} selectedDecisionId={proposedDecision.id} onSelect={onSelect} />);

    fireEvent.click(screen.getByText(proposedDecision.sourceRecommendation));
    expect(onSelect).toHaveBeenCalledWith(proposedDecision);
  });

  it('renders decision detail and submits status updates', async () => {
    const onUpdateStatus = vi.fn().mockResolvedValue(approvedDecision);

    render(<DecisionRecordDetail decision={proposedDecision} onUpdateStatus={onUpdateStatus} />);

    expect(screen.getByText('Decision records do not execute actions or create automation queue entries.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Approved for follow-up.' } });
    fireEvent.click(screen.getByText('Update status'));

    await waitFor(() => expect(onUpdateStatus).toHaveBeenCalled());
    expect(onUpdateStatus.mock.calls[0][1]).toMatchObject({ status: 'approved', note: 'Approved for follow-up.' });
  });
});
