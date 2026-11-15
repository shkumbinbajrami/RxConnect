export type VisitStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED';
export type Visit = { id: string; doctorId: string; doctorName: string | null; patientId: string; patientName: string | null; status: VisitStatus; notes: string | null; scheduledAt: string | null; startedAt: string | null; endedAt: string | null; createdAt: string; updatedAt: string };
export type PatientSearch = { id: string; email: string; fullName: string | null };
