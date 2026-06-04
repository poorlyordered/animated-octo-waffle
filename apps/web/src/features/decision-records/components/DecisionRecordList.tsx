import { useEffect, useMemo, useState } from 'react';
import type { DecisionRecord } from '@gryyk/contracts';
import {
  defaultDecisionListSettings,
  decisionListCounts,
  decisionListPageSizes,
  decisionSourceLabel,
  filterDecisionRecords,
  paginateDecisionRecords,
  readDecisionListSettings,
  writeDecisionListSettings,
  type DecisionListPageSize,
  type DecisionSourceFilter,
  type DecisionStatusFilter
} from '../services/decisionListFilters';

interface DecisionRecordListProps {
  decisions: DecisionRecord[];
  selectedDecisionId?: string;
  onSelect: (decision: DecisionRecord) => void;
}

const decisionListSettingsStorageKey = 'gryyk47.decisionListSettings';

function initialDecisionListSettings() {
  if (typeof window === 'undefined') {
    return defaultDecisionListSettings;
  }

  return readDecisionListSettings(window.localStorage, decisionListSettingsStorageKey);
}

export function DecisionRecordList({ decisions, selectedDecisionId, onSelect }: DecisionRecordListProps) {
  const [settings, setSettings] = useState(initialDecisionListSettings);
  const [page, setPage] = useState(1);
  const filteredDecisions = useMemo(
    () => filterDecisionRecords(decisions, { source: settings.source, status: settings.status }),
    [decisions, settings.source, settings.status]
  );
  const counts = useMemo(() => decisionListCounts(decisions, filteredDecisions), [decisions, filteredDecisions]);
  const totalPages = Math.max(1, Math.ceil(filteredDecisions.length / settings.pageSize));
  const activePage = Math.min(page, totalPages);
  const pagedDecisions = useMemo(
    () => paginateDecisionRecords(filteredDecisions, activePage, settings.pageSize),
    [activePage, filteredDecisions, settings.pageSize]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeDecisionListSettings(window.localStorage, decisionListSettingsStorageKey, settings);
    }
  }, [settings]);

  function updateStatusFilter(status: DecisionStatusFilter) {
    setSettings((current) => ({ ...current, status }));
    setPage(1);
  }

  function updateSourceFilter(source: DecisionSourceFilter) {
    setSettings((current) => ({ ...current, source }));
    setPage(1);
  }

  function updatePageSize(pageSize: DecisionListPageSize) {
    setSettings((current) => ({ ...current, pageSize }));
    setPage(1);
  }

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
          <select value={settings.status} onChange={(event) => updateStatusFilter(event.target.value as DecisionStatusFilter)}>
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
          <select value={settings.source} onChange={(event) => updateSourceFilter(event.target.value as DecisionSourceFilter)}>
            <option value="all">All sources</option>
            <option value="opportunity">Opportunity / brief</option>
            <option value="numbers">Numbers follow-up</option>
          </select>
        </label>
        <label>
          Page size
          <select value={settings.pageSize} onChange={(event) => updatePageSize(Number(event.target.value) as DecisionListPageSize)}>
            {decisionListPageSizes.map((pageSize) => (
              <option value={pageSize} key={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filteredDecisions.length === 0 ? <p className="empty-state">No decisions match the selected filters.</p> : null}
      <div className="decision-list">
        {pagedDecisions.items.map((decision) => (
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
      <div className="form-actions" aria-label="Decision pagination">
        <button type="button" disabled={pagedDecisions.page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </button>
        <span>
          Page {pagedDecisions.page} of {pagedDecisions.totalPages}. Showing {pagedDecisions.startIndex}-{pagedDecisions.endIndex} of{' '}
          {pagedDecisions.totalItems}.
        </span>
        <button
          type="button"
          disabled={pagedDecisions.page === pagedDecisions.totalPages}
          onClick={() => setPage((current) => Math.min(pagedDecisions.totalPages, current + 1))}
        >
          Next
        </button>
      </div>
      <p className="notice">Decision filters organize records only. They do not approve decisions, create queued work, dispatch workers, retry, or perform EVE actions.</p>
    </section>
  );
}
