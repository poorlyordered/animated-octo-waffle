import {
  numbersFollowUpDecisionResponseSchema,
  numbersFollowUpQueueResponseSchema,
  numbersSnapshotResponseSchema
} from '@gryyk/contracts';
import { numbersSnapshot } from '../fixtures/numbers';
import {
  numbersFollowUpDecision,
  numbersFollowUpOrigin,
  numbersFollowUpQueueItem
} from '../fixtures/numbersFollowUpActions';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';

describe('Numbers API contract', () => {
  it('accepts processed numbers snapshot responses', () => {
    const parsed = numbersSnapshotResponseSchema.parse({ snapshot: numbersSnapshot });

    expect(parsed.snapshot?.sections).toHaveLength(5);
    expect(parsed.snapshot?.provenance.sourceCount).toBe(2);
  });

  it('accepts empty numbers snapshot responses', () => {
    expect(numbersSnapshotResponseSchema.parse({ snapshot: null })).toEqual({ snapshot: null });
  });

  it('keeps no-session fallback corporation scope and ignores browser inputs', () => {
    const scope = getAuthScope(
      {
        headers: { 'x-corporation-id': 'browser-corp' },
        queryStringParameters: { corporationId: 'query-corp', walletAction: 'transfer' },
        body: JSON.stringify({ corporationId: 'body-corp', executeNow: true })
      },
      { EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' }
    );

    expect(scope.corporationId).toBe('917701062');
  });

  it('does not include secrets or dispatch targets in browser-visible numbers JSON', () => {
    const body = JSON.stringify({ snapshot: numbersSnapshot });

    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('credential');
    expect(body).not.toContain('dispatchTarget');
  });

  it('accepts follow-up decision creation responses with origin metadata', () => {
    const parsed = numbersFollowUpDecisionResponseSchema.parse({
      decision: numbersFollowUpDecision,
      origin: numbersFollowUpOrigin,
      message:
        'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.'
    });

    expect(parsed.decision.status).toBe('proposed');
    expect(parsed.decision.sourceContext?.sourceType).toBe('numbers_follow_up');
    expect(parsed.origin.candidateId).toBe(numbersSnapshot.followUps[0].id);
  });

  it('accepts duplicate follow-up decision responses', () => {
    const parsed = numbersFollowUpDecisionResponseSchema.parse({
      decision: numbersFollowUpDecision,
      origin: numbersFollowUpOrigin,
      duplicate: true,
      message: 'Existing decision surfaced. No duplicate was created.'
    });

    expect(parsed.duplicate).toBe(true);
  });

  it('accepts follow-up queue creation responses without execution metadata', () => {
    const parsed = numbersFollowUpQueueResponseSchema.parse({
      queueItem: numbersFollowUpQueueItem,
      origin: numbersFollowUpOrigin,
      message:
        'Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed.'
    });

    expect(parsed.queueItem.status).toBe('queued');
    expect(parsed.queueItem.attempts).toBe(0);

    const body = JSON.stringify(parsed);
    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('dispatchTarget');
  });
});
