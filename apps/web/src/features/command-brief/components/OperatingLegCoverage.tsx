import type { OperatingLegCoverage as Coverage } from '@gryyk/contracts';

interface OperatingLegCoverageProps {
  coverage: Coverage;
}

const labels = {
  numbers: 'Numbers',
  opportunity: 'Opportunity',
  people: 'People'
} as const;

export function OperatingLegCoverage({ coverage }: OperatingLegCoverageProps) {
  return (
    <section className="coverage" aria-label="Operating model coverage">
      <div className="coverage-grid">
        {Object.entries(labels).map(([key, label]) => {
          const state = coverage[key as keyof typeof labels];
          return (
            <div className={`coverage-item coverage-item-${state}`} key={key}>
              <span>{label}</span>
              <strong>{state}</strong>
            </div>
          );
        })}
      </div>
      {coverage.missingReasons.length > 0 ? (
        <ul className="missing-reasons">
          {coverage.missingReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
