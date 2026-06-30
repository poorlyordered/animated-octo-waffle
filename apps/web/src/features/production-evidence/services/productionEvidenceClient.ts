import {
  createProductionEvidenceRequestSchema,
  productionEvidenceListResponseSchema,
  productionEvidenceRecordResponseSchema,
  type CreateProductionEvidenceRequest,
  type ProductionEvidenceListResponse,
  type ProductionEvidenceRecordResponse
} from '@gryyk/contracts';

export async function getProductionEvidence(): Promise<ProductionEvidenceListResponse> {
  const response = await fetch('/api/production-evidence');

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return productionEvidenceListResponseSchema.parse(await response.json());
}

export async function createProductionEvidence(
  request: CreateProductionEvidenceRequest
): Promise<ProductionEvidenceRecordResponse> {
  const response = await fetch('/api/production-evidence', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(createProductionEvidenceRequestSchema.parse(request))
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return productionEvidenceRecordResponseSchema.parse(await response.json());
}
