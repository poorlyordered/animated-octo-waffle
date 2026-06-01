import { useState, type FormEvent } from 'react';
import type { CommandBrief, CreateDecisionRecordRequest, DecisionRecord } from '@gryyk/contracts';

interface DecisionRecordCreateProps {
  brief: CommandBrief;
  recommendation: string;
  onCancel: () => void;
  onCreate: (request: CreateDecisionRecordRequest) => DecisionRecord | Promise<DecisionRecord | void> | void;
}

export function DecisionRecordCreate({ brief, recommendation, onCancel, onCreate }: DecisionRecordCreateProps) {
  const [rationale, setRationale] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [isPlayerImpacting, setIsPlayerImpacting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onCreate({
        sourceBriefId: brief.id,
        sourceRecommendation: recommendation,
        rationale,
        expectedResult,
        isPlayerImpacting
      });
      setRationale('');
      setExpectedResult('');
      setIsPlayerImpacting(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create decision record.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="decision-create" aria-label="Create decision record">
      <h2>Record decision</h2>
      <p className="decision-source">{recommendation}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Rationale
          <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} required />
        </label>
        <label>
          Expected result
          <textarea value={expectedResult} onChange={(event) => setExpectedResult(event.target.value)} required />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isPlayerImpacting}
            onChange={(event) => setIsPlayerImpacting(event.target.checked)}
          />
          Player-impacting decision
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Recording...' : 'Record decision'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
