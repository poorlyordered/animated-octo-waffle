import {
  numbersLiveProvenanceSchema,
  numbersFollowUpDecisionResponseSchema,
  numbersFollowUpQueueResponseSchema,
  numbersSnapshotResponseSchema
} from '@gryyk/contracts';
import { numbersLiveProvenance, numbersSnapshot } from '../fixtures/numbers';
import {
  numbersFollowUpDecision,
  numbersFollowUpDecisionResponse,
  numbersFollowUpOrigin,
  numbersFollowUpQueueItem,
  numbersFollowUpQueueResponse,
  approvedNumbersFollowUpDecisionResponse
} from '../fixtures/numbersFollowUpActions';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';

describe('Numbers API contract', () => {
  it('accepts processed numbers snapshot responses', () => {
    const parsed = numbersSnapshotResponseSchema.parse({ snapshot: numbersSnapshot, liveProvenance: numbersLiveProvenance });

    expect(parsed.snapshot?.sections).toHaveLength(5);
    expect(parsed.snapshot?.provenance.sourceCount).toBe(2);
    expect(parsed.liveProvenance?.mode).toBe('live_sync');
  });

  it('accepts empty numbers snapshot responses', () => {
    expect(numbersSnapshotResponseSchema.parse({ snapshot: null })).toEqual({ snapshot: null });
    expect(numbersLiveProvenanceSchema.parse({
      mode: 'unavailable',
      sourceCount: 0,
      sectionStatuses: [],
      message: 'No processed Numbers snapshot is available for this corporation scope.',
      boundary: 'Read-only provenance.'
    }).mode).toBe('unavailable');
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
    const body = JSON.stringify({ snapshot: numbersSnapshot, liveProvenance: numbersLiveProvenance });

    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('credential');
    expect(body).not.toContain('dispatchTarget');
    expect(body).not.toContain('retrySchedule');
  });

  it('accepts follow-up decision creation responses with origin metadata', () => {
    const parsed = numbersFollowUpDecisionResponseSchema.parse({
      decision: numbersFollowUpDecision,
      origin: numbersFollowUpOrigin,
      approvalHandoff: numbersFollowUpDecisionResponse.approvalHandoff,
      message:
        'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.'
    });

    expect(parsed.decision.status).toBe('proposed');
    expect(parsed.decision.sourceContext?.sourceType).toBe('numbers_follow_up');
    expect(parsed.origin.candidateId).toBe(numbersSnapshot.followUps[0].id);
    expect(parsed.approvalHandoff.approvalRequired).toBe(true);
    expect(parsed.approvalHandoff.queueReady).toBe(false);
  });

  it('accepts approved follow-up decision handoff responses', () => {
    const parsed = numbersFollowUpDecisionResponseSchema.parse(approvedNumbersFollowUpDecisionResponse);

    expect(parsed.decision.status).toBe('approved');
    expect(parsed.approvalHandoff.approvalRequired).toBe(false);
    expect(parsed.approvalHandoff.queueReady).toBe(true);
  });

  it('accepts duplicate follow-up decision responses', () => {
    const parsed = numbersFollowUpDecisionResponseSchema.parse({
      decision: numbersFollowUpDecision,
      origin: numbersFollowUpOrigin,
      approvalHandoff: {
        ...numbersFollowUpDecisionResponse.approvalHandoff,
        duplicate: true
      },
      duplicate: true,
      message: 'Existing decision surfaced. No duplicate was created.'
    });

    expect(parsed.duplicate).toBe(true);
  });

  it('accepts follow-up queue creation responses without execution metadata', () => {
    const parsed = numbersFollowUpQueueResponseSchema.parse({
      queueItem: numbersFollowUpQueueItem,
      origin: numbersFollowUpOrigin,
      approvalHandoff: numbersFollowUpQueueResponse.approvalHandoff,
      message:
        'Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed.'
    });

    expect(parsed.queueItem.status).toBe('queued');
    expect(parsed.queueItem.attempts).toBe(0);
    expect(parsed.approvalHandoff.queueItemId).toBe(numbersFollowUpQueueItem.id);
    expect(parsed.approvalHandoff.boundary).toContain('No worker was dispatched');

    const body = JSON.stringify(parsed);
    expect(body).not.toContain('token');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('dispatchTarget');
  });
});
