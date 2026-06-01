import { describe, expect, it } from 'vitest';
import { assertQueueEligibleDecision } from '../../../../netlify/functions/_shared/automation-queue-rules';
import { approvedDecision, playerImpactingDecision, proposedDecision, rejectedDecision } from '../fixtures/decisionRecords';
import { approvedPlayerImpactingDecision } from '../fixtures/automationQueue';

describe('automation queue rules', () => {
  it('allows approved decisions', () => {
    expect(() => assertQueueEligibleDecision(approvedDecision)).not.toThrow();
  });

  it('rejects decisions that are not approved', () => {
    expect(() => assertQueueEligibleDecision(proposedDecision)).toThrow('Only approved decisions');
    expect(() => assertQueueEligibleDecision(rejectedDecision)).toThrow('Only approved decisions');
  });

  it('rejects player-impacting decisions without approval metadata', () => {
    expect(() => assertQueueEligibleDecision({ ...playerImpactingDecision, status: 'approved' })).toThrow(
      'Explicit approval'
    );
  });

  it('allows player-impacting decisions with approval metadata', () => {
    expect(() => assertQueueEligibleDecision(approvedPlayerImpactingDecision)).not.toThrow();
  });
});
