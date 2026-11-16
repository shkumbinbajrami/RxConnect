export type Page<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };

export function listParams(input: { page: number; limit?: number; search?: string; status?: string; isActive?: boolean; inStock?: boolean; visitId?: string; patientId?: string }) {
  const params = new URLSearchParams({ page: String(input.page), limit: String(input.limit ?? 20) });
  if (input.search?.trim()) params.set('search', input.search.trim());
  if (input.status) params.set('status', input.status);
  if (input.isActive !== undefined) params.set('isActive', String(input.isActive));
  if (input.inStock !== undefined) params.set('inStock', String(input.inStock));
  if (input.visitId) params.set('visitId', input.visitId);
  if (input.patientId) params.set('patientId', input.patientId);
  return params.toString();
}
