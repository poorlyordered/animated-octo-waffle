import type { DecisionRecord } from '@gryyk/contracts';

interface DecisionRecordListProps {
  decisions: DecisionRecord[];
  selectedDecisionId?: string;
  onSelect: (decision: DecisionRecord) => void;
}

export function DecisionRecordList({ decisions, selectedDecisionId, onSelect }: DecisionRecordListProps) {
  if (decisions.length === 0) {
    return <section className="empty-state">No decisions have been recorded yet.</section>;
  }

  return (
    <section aria-label="Decision records">
      <h2>Decision records</h2>
      <div className="decision-list">
        {decisions.map((decision) => (
          <button
            className={decision.id === selectedDecisionId ? 'decision-list-item selected' : 'decision-list-item'}
            key={decision.id}
            type="button"
            onClick={() => onSelect(decision)}
          >
            <span>{decision.sourceRecommendation}</span>
            <strong>{decision.status}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
