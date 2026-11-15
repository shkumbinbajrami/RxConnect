import { apiRequest } from '@/lib/api-request';
import type { PatientSearch, Visit } from './types';

export const visitKeys = { all: ['visits'] as const, list: (userId: string) => ['visits', userId] as const };
export const listVisits = () => apiRequest<Visit[]>('/visits');
export const findPatient = (email: string) => apiRequest<PatientSearch>(`/visits/patients/search?email=${encodeURIComponent(email)}`);
export const createVisit = (input: { patientId: string; scheduledAt?: string; notes?: string }) => apiRequest<Visit>('/visits', { method: 'POST', body: JSON.stringify(input) });
export const updateVisit = (id: string, input: { scheduledAt?: string | null; notes?: string | null }) => apiRequest<Visit>(`/visits/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const visitAction = (id: string, action: 'start' | 'complete' | 'cancel' | 'discontinue') => apiRequest<Visit>(`/visits/${id}/${action}`, { method: 'POST' });
export const deleteVisit = (id: string) => apiRequest<Visit>(`/visits/${id}`, { method: 'DELETE' });
