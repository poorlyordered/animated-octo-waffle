import { useMemo, useState } from 'react';
import type { DecisionRecord } from '@gryyk/contracts';
import {
  decisionListCounts,
  decisionSourceLabel,
  filterDecisionRecords,
  type DecisionSourceFilter,
  type DecisionStatusFilter
} from '../services/decisionListFilters';

interface DecisionRecordListProps {
  decisions: DecisionRecord[];
  selectedDecisionId?: string;
  onSelect: (decision: DecisionRecord) => void;
}

export function DecisionRecordList({ decisions, selectedDecisionId, onSelect }: DecisionRecordListProps) {
  const [statusFilter, setStatusFilter] = useState<DecisionStatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<DecisionSourceFilter>('all');
  const filteredDecisions = useMemo(
    () => filterDecisionRecords(decisions, { source: sourceFilter, status: statusFilter }),
    [decisions, sourceFilter, statusFilter]
  );
  const counts = useMemo(() => decisionListCounts(decisions, filteredDecisions), [decisions, filteredDecisions]);

  if (decisions.length === 0) {
    return <section className="empty-state">No decisions have been recorded yet.</section>;
  }

  return (
    <section aria-label="Decision records">
      <h2>Decision records</h2>
      <div className="metadata-grid" aria-label="Decision workload counts">
        <div className="metadata-item">
          <span>Visible</span>
          <strong>{counts.visible}</strong>
        </div>
        <div className="metadata-item">
          <span>Total</span>
          <strong>{counts.total}</strong>
        </div>
        <div className="metadata-item">
          <span>Proposed</span>
          <strong>{counts.proposed}</strong>
        </div>
        <div className="metadata-item">
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </div>
        <div className="metadata-item">
          <span>Rejected</span>
          <strong>{counts.rejected}</strong>
        </div>
        <div className="metadata-item">
          <span>Player-impacting</span>
          <strong>{counts.playerImpacting}</strong>
        </div>
      </div>
      <div className="form-actions" aria-label="Decision filters">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DecisionStatusFilter)}>
            <option value="all">All statuses</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="delegated">Delegated</option>
            <option value="done">Done</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label>
          Source
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as DecisionSourceFilter)}>
            <option value="all">All sources</option>
            <option value="opportunity">Opportunity / brief</option>
            <option value="numbers">Numbers follow-up</option>
          </select>
        </label>
      </div>
      {filteredDecisions.length === 0 ? <p className="empty-state">No decisions match the selected filters.</p> : null}
      <div className="decision-list">
        {filteredDecisions.map((decision) => (
          <button
            className={decision.id === selectedDecisionId ? 'decision-list-item selected' : 'decision-list-item'}
            key={decision.id}
            type="button"
            onClick={() => onSelect(decision)}
          >
            <span>
              {decision.sourceRecommendation}
              <small> Source: {decisionSourceLabel(decision)}</small>
            </span>
            <strong>{decision.status}</strong>
          </button>
        ))}
      </div>
      <p className="notice">Decision filters organize records only. They do not approve decisions, create queued work, dispatch workers, retry, or perform EVE actions.</p>
    </section>
  );
}
