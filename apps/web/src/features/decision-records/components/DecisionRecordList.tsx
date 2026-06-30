import { useEffect, useMemo, useState } from 'react';
import type { DecisionRecord, DecisionRecordListResponse } from '@gryyk/contracts';
import {
  defaultDecisionListSettings,
  decisionListCounts,
  decisionListPageSizes,
  decisionSourceLabel,
  decisionServerFilters,
  readDecisionListSettings,
  writeDecisionListSettings,
  type DecisionListPageSize,
  type DecisionSourceFilter,
  type DecisionStatusFilter
} from '../services/decisionListFilters';

interface DecisionRecordListProps {
  decisions: DecisionRecord[];
  pagination: DecisionRecordListResponse['pagination'];
  selectedDecisionId?: string;
  onFiltersChange?: (filters: ReturnType<typeof decisionServerFilters>) => void;
  onSelect: (decision: DecisionRecord) => void;
}

const decisionListSettingsStorageKey = 'gryyk47.decisionListSettings';

function initialDecisionListSettings() {
  if (typeof window === 'undefined') {
    return defaultDecisionListSettings;
  }

  return readDecisionListSettings(window.localStorage, decisionListSettingsStorageKey);
}

export function DecisionRecordList({ decisions, pagination, selectedDecisionId, onFiltersChange, onSelect }: DecisionRecordListProps) {
  const [settings, setSettings] = useState(initialDecisionListSettings);
  const [page, setPage] = useState(1);
  const counts = useMemo(() => decisionListCounts(decisions, decisions), [decisions]);
  const hasActiveFilters = settings.status !== 'all' || settings.source !== 'all';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeDecisionListSettings(window.localStorage, decisionListSettingsStorageKey, settings);
    }
  }, [settings]);

  useEffect(() => {
    onFiltersChange?.(decisionServerFilters({ source: settings.source, status: settings.status }, page, settings.pageSize));
  }, [onFiltersChange, page, settings.pageSize, settings.source, settings.status]);

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
          <strong>{pagination.totalItems}</strong>
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
            <option value="people">People follow-up</option>
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
      {decisions.length === 0 ? (
        <p className="empty-state">{hasActiveFilters ? 'No decisions match the selected filters.' : 'No decisions have been recorded yet.'}</p>
      ) : null}
      <div className="decision-list">
        {decisions.map((decision) => (
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
        <button type="button" disabled={pagination.page === 1} onClick={() => setPage(Math.max(1, pagination.page - 1))}>
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}. Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}.
        </span>
        <button
          type="button"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
        >
          Next
        </button>
      </div>
      <p className="notice">Decision filters organize records only. They do not approve decisions, create queued work, dispatch workers, retry, or perform EVE actions.</p>
    </section>
  );
}
