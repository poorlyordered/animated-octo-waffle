import { useCallback, useEffect, useState } from 'react';
import type { CreateProductionEvidenceRequest, ProductionEvidenceListResponse } from '@gryyk/contracts';
import { createProductionEvidence, getProductionEvidence } from '../services/productionEvidenceClient';

interface ProductionEvidenceState {
  error: string | null;
  evidence: ProductionEvidenceListResponse | null;
  loading: boolean;
  saving: boolean;
  createRecord: (request: CreateProductionEvidenceRequest) => Promise<void>;
}

export function useProductionEvidence(): ProductionEvidenceState {
  const [state, setState] = useState<Omit<ProductionEvidenceState, 'createRecord'>>({
    error: null,
    evidence: null,
    loading: true,
    saving: false
  });

  const load = useCallback(async (active = true) => {
    try {
      const evidence = await getProductionEvidence();
      if (active) {
        setState((current) => ({ ...current, error: null, evidence, loading: false }));
      }
    } catch (error) {
      if (active) {
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Unable to load production evidence.',
          evidence: null,
          loading: false
        }));
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    void load(active);

    return () => {
      active = false;
    };
  }, [load]);

  const createRecord = useCallback(
    async (request: CreateProductionEvidenceRequest) => {
      setState((current) => ({ ...current, error: null, saving: true }));
      try {
        await createProductionEvidence(request);
        await load(true);
      } catch (error) {
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : 'Unable to record production evidence.'
        }));
      } finally {
        setState((current) => ({ ...current, saving: false }));
      }
    },
    [load]
  );

  return { ...state, createRecord };
}
