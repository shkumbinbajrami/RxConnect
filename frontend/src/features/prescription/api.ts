import { apiRequest } from '@/lib/api-request';
import type { Dispense, PharmacyOption, Prescription, PrescriptionAccess, PrescriptionInput } from './types';

export const prescriptionKeys = { all: ['prescriptions'] as const, list: (userId: string) => ['prescriptions', userId] as const, access: (id: string) => ['prescriptions', id, 'access'] as const, pharmacies: (id: string) => ['prescriptions', id, 'pharmacies'] as const, fills: (id: string) => ['prescriptions', id, 'fills'] as const, pharmacyDispenses: (id: string) => ['pharmacy-dispenses', id] as const };
export const listPrescriptions = () => apiRequest<Prescription[]>('/prescriptions');
export const createPrescription = (input: PrescriptionInput) => apiRequest<Prescription>('/prescriptions', { method: 'POST', body: JSON.stringify(input) });
export const updatePrescription = (id: string, items: PrescriptionInput['items']) => apiRequest<Prescription>(`/prescriptions/${id}`, { method: 'PATCH', body: JSON.stringify({ items }) });
export const issuePrescription = (id: string, expiresAt: string) => apiRequest<Prescription>(`/prescriptions/${id}/issue`, { method: 'POST', body: JSON.stringify({ expiresAt }) });
export const cancelPrescription = (id: string) => apiRequest<Prescription>(`/prescriptions/${id}/cancel`, { method: 'POST' });
export const deletePrescription = (id: string) => apiRequest<void>(`/prescriptions/${id}`, { method: 'DELETE' });
export const getPrescriptionAccess = (id: string) => apiRequest<PrescriptionAccess>(`/prescriptions/${id}/access`);
export const listPharmacyOptions = (id: string) => apiRequest<PharmacyOption[]>(`/prescriptions/${id}/pharmacies`);
export const listFills = (id: string) => apiRequest<Dispense[]>(`/prescriptions/${id}/fills`);
export const lookupPrescription = (input: { code?: string; qrToken?: string }) => apiRequest<Prescription>('/prescriptions/lookup', { method: 'POST', body: JSON.stringify(input) });
export const dispensePrescription = (id: string, input: { code?: string; qrToken?: string; items: { prescriptionItemId: string; quantity: number }[] }) => apiRequest<Dispense>(`/prescriptions/${id}/dispense`, { method: 'POST', body: JSON.stringify(input) });
export const listPharmacyDispenses = () => apiRequest<Dispense[]>('/prescriptions/dispenses/mine');
export const reverseDispense = (id: string, reason: string) => apiRequest<Dispense>(`/prescriptions/dispenses/${id}/reverse`, { method: 'POST', body: JSON.stringify({ reason }) });
