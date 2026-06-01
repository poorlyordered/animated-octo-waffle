import { useState, type FormEvent } from 'react';
import type { CreateLeadershipFollowUpRequest, FollowUpPriority, LeadershipFollowUp, MemberProfile } from '@gryyk/contracts';

interface PeopleFollowUpCreateProps {
  member: MemberProfile | null;
  onCreate: (request: CreateLeadershipFollowUpRequest) => Promise<LeadershipFollowUp>;
}

const priorities: FollowUpPriority[] = ['low', 'medium', 'high', 'urgent'];

export function PeopleFollowUpCreate({ member, onCreate }: PeopleFollowUpCreateProps) {
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<FollowUpPriority>('medium');
  const [owner, setOwner] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [sourceDecisionId, setSourceDecisionId] = useState('');
  const [sourceQueueItemId, setSourceQueueItemId] = useState('');
  const [isPlayerImpacting, setIsPlayerImpacting] = useState(false);
  const [approvalText, setApprovalText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) {
      return;
    }

    try {
      await onCreate({
        memberProfileId: member.id,
        reason,
        priority,
        owner: owner || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        sourceDecisionId: sourceDecisionId || undefined,
        sourceQueueItemId: sourceQueueItemId || undefined,
        isPlayerImpacting,
        approvalText: approvalText || undefined
      });
      setReason('');
      setOwner('');
      setDueAt('');
      setSourceDecisionId('');
      setSourceQueueItemId('');
      setIsPlayerImpacting(false);
      setApprovalText('');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create follow-up.');
    }
  }

  return (
    <section aria-label="Create leadership follow-up">
      <h2>Create follow-up</h2>
      <form onSubmit={submit}>
        <label>
          Reason
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} required />
        </label>
        <label>
          Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as FollowUpPriority)}>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <input value={owner} onChange={(event) => setOwner(event.target.value)} />
        </label>
        <label>
          Due
          <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
        </label>
        <label>
          Source decision
          <input value={sourceDecisionId} onChange={(event) => setSourceDecisionId(event.target.value)} />
        </label>
        <label>
          Source queue item
          <input value={sourceQueueItemId} onChange={(event) => setSourceQueueItemId(event.target.value)} />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isPlayerImpacting}
            onChange={(event) => setIsPlayerImpacting(event.target.checked)}
          />
          Player-impacting follow-up
        </label>
        {isPlayerImpacting ? (
          <label>
            Approval text
            <textarea value={approvalText} onChange={(event) => setApprovalText(event.target.value)} required />
          </label>
        ) : null}
        <p className="notice">Follow-ups do not change roles, access, queue status, or EVE state.</p>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button type="submit" disabled={!member}>
            Add follow-up
          </button>
        </div>
      </form>
    </section>
  );
}
