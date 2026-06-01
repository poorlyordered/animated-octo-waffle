import type { DecisionRecord } from '@gryyk/contracts';
import { OperatingLegCoverage } from '../../command-brief/components/OperatingLegCoverage';

interface DecisionRecordSummaryProps {
  decision: DecisionRecord;
}

export function DecisionRecordSummary({ decision }: DecisionRecordSummaryProps) {
  return (
    <section className="decision-summary" aria-label="Decision record summary">
      <h2>Decision recorded</h2>
      <p>{decision.sourceRecommendation}</p>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{decision.status}</dd>
        </div>
        <div>
          <dt>Rationale</dt>
          <dd>{decision.rationale}</dd>
        </div>
        <div>
          <dt>Expected result</dt>
          <dd>{decision.expectedResult}</dd>
        </div>
        <div>
          <dt>Source brief</dt>
          <dd>{decision.sourceBriefId}</dd>
        </div>
      </dl>
      <OperatingLegCoverage coverage={decision.sourceProvenance.coverage} />
    </section>
  );
}
