import { apiRequest } from '@/lib/api-request';
import { listParams, type Page } from '@/lib/pagination';
import type { PharmacyStock } from './types';

export const stockKeys = {
  list: (pharmacyId: string) => ['pharmacy-stock', pharmacyId] as const,
};

export function listStock() {
  return apiRequest<PharmacyStock[]>('/pharmacy/stock');
}
export const searchStock = (query: { page: number; limit?: number; search?: string; inStock?: boolean }) => apiRequest<Page<PharmacyStock>>(`/pharmacy/stock?${listParams(query)}`);

export function addStock(input: { medicineId: string; quantity: number }) {
  return apiRequest<PharmacyStock>('/pharmacy/stock', { method: 'POST', body: JSON.stringify(input) });
}

export function updateStock(medicineId: string, quantity: number) {
  return apiRequest<PharmacyStock>(`/pharmacy/stock/${medicineId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
}

export function deleteStock(medicineId: string) {
  return apiRequest<PharmacyStock>(`/pharmacy/stock/${medicineId}`, { method: 'DELETE' });
}
