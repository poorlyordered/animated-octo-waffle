import { ProductionEvidencePanel } from '../features/production-evidence/components/ProductionEvidencePanel';
import { useProductionEvidence } from '../features/production-evidence/state/useProductionEvidence';

export function ProductionEvidenceRoute() {
  const productionEvidence = useProductionEvidence();

  return (
    <ProductionEvidencePanel
      error={productionEvidence.error}
      evidence={productionEvidence.evidence}
      loading={productionEvidence.loading}
      onCreate={productionEvidence.createRecord}
      saving={productionEvidence.saving}
    />
  );
}
