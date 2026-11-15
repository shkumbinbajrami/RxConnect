import { Prisma, VisitStatus } from '@prisma/client';

export type VisitWithPeople = Prisma.VisitGetPayload<{ include: { doctor: true; patient: true } }>;

export class VisitEntity {
  id: string;
  doctorId: string;
  doctorName: string | null;
  patientId: string;
  patientName: string | null;
  status: VisitStatus;
  notes: string | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(visit: VisitWithPeople, showNotes = true) {
    this.id = visit.id;
    this.doctorId = visit.doctorId;
    this.doctorName = visit.doctor.fullName;
    this.patientId = visit.patientId;
    this.patientName = visit.patient.fullName;
    this.status = visit.status;
    this.notes = showNotes ? visit.notes : null;
    this.scheduledAt = visit.scheduledAt;
    this.startedAt = visit.startedAt;
    this.endedAt = visit.endedAt;
    this.createdAt = visit.createdAt;
    this.updatedAt = visit.updatedAt;
  }
}
