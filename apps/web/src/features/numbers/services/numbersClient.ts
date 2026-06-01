import { numbersSnapshotResponseSchema, type NumbersSnapshotResponse } from '@gryyk/contracts';

export async function getNumbersSnapshot(focus = 'corporation'): Promise<NumbersSnapshotResponse> {
  const params = new URLSearchParams({ focus });
  const response = await fetch(`/api/numbers?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return numbersSnapshotResponseSchema.parse(await response.json());
}
