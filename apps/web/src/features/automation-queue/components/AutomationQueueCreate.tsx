import { useState, type FormEvent } from 'react';
import type { AutomationQueueItem, CreateAutomationQueueItemRequest, DecisionRecord } from '@gryyk/contracts';
import { AutomationQueueSummary } from './AutomationQueueSummary';

interface AutomationQueueCreateProps {
  decision: DecisionRecord;
  onCreate: (request: CreateAutomationQueueItemRequest) => Promise<AutomationQueueItem> | void;
}

export function AutomationQueueCreate({ decision, onCreate }: AutomationQueueCreateProps) {
  const [taskIntent, setTaskIntent] = useState(decision.sourceRecommendation);
  const [inputSummary, setInputSummary] = useState(decision.rationale);
  const [expectedOutput, setExpectedOutput] = useState(decision.expectedResult);
  const [owner, setOwner] = useState('');
  const [createdQueueItem, setCreatedQueueItem] = useState<AutomationQueueItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canQueue = decision.status === 'approved' && (!decision.isPlayerImpacting || Boolean(decision.approval));

  async function submitQueueItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const queueItem = await onCreate({
        sourceDecisionId: decision.id,
        taskIntent,
        inputSummary,
        expectedOutput,
        owner: owner || undefined
      });

      if (queueItem) {
        setCreatedQueueItem(queueItem);
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create queued work.');
    }
  }

  return (
    <section aria-label="Create queued work">
      <h3>Create queued work</h3>
      {!canQueue ? (
        <p className="notice">Only approved decisions with required approval metadata can create queued work.</p>
      ) : null}
      <form onSubmit={submitQueueItem}>
        <label>
          Task intent
          <textarea value={taskIntent} onChange={(event) => setTaskIntent(event.target.value)} />
        </label>
        <label>
          Input summary
          <textarea value={inputSummary} onChange={(event) => setInputSummary(event.target.value)} />
        </label>
        <label>
          Expected output
          <textarea value={expectedOutput} onChange={(event) => setExpectedOutput(event.target.value)} />
        </label>
        <label>
          Owner
          <input value={owner} onChange={(event) => setOwner(event.target.value)} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={!canQueue}>
          Queue work
        </button>
      </form>
      {createdQueueItem ? <AutomationQueueSummary queueItem={createdQueueItem} /> : null}
    </section>
  );
}
