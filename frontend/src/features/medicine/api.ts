import { apiRequest } from '@/lib/api-request';
import type { Medicine, MedicineInput } from './types';

export const medicineKeys = {
  all: ['medicines'] as const,
  list: (role: 'admin' | 'pharmacy') => ['medicines', role] as const,
};

export function listMedicines() {
  return apiRequest<Medicine[]>('/medicine');
}

export function createMedicine(input: MedicineInput) {
  return apiRequest<Medicine>('/medicine', { method: 'POST', body: JSON.stringify(input) });
}

export function updateMedicine(id: string, input: MedicineInput) {
  return apiRequest<Medicine>(`/medicine/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteMedicine(id: string) {
  return apiRequest<Medicine>(`/medicine/${id}`, { method: 'DELETE' });
}
