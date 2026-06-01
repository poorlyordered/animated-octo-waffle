import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DecisionRecordCreate } from '../../src/features/decision-records/components/DecisionRecordCreate';
import { processedBrief } from '../fixtures/commandBrief';
import { proposedDecision } from '../fixtures/decisionRecords';

describe('DecisionRecordCreate', () => {
  it('submits a decision record from a recommendation', async () => {
    const onCreate = vi.fn().mockResolvedValue(proposedDecision);

    render(
      <DecisionRecordCreate
        brief={processedBrief}
        recommendation={processedBrief.recommendedActions[0]}
        onCancel={vi.fn()}
        onCreate={onCreate}
      />
    );

    fireEvent.change(screen.getByLabelText('Rationale'), { target: { value: 'Patch timing matters.' } });
    fireEvent.change(screen.getByLabelText('Expected result'), { target: { value: 'Leadership has a follow-up.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }));

    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      sourceBriefId: processedBrief.id,
      sourceRecommendation: processedBrief.recommendedActions[0],
      isPlayerImpacting: false
    });
  });
});
