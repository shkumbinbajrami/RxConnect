import { Prisma, PrescriptionStatus } from '@prisma/client';

export type PrescriptionRecord = Prisma.PrescriptionGetPayload<{
  include: { visit: { include: { patient: true; doctor: true } }; items: { include: { medicine: true } }; dispenses: { include: { items: true } } };
}>;

export class PrescriptionEntity {
  id: string;
  visitId: string;
  status: PrescriptionStatus;
  issuedAt: Date | null;
  expiresAt: Date | null;
  cancelledAt: Date | null;
  replacesId: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; fullName: string | null };
  doctor: { id: string; fullName: string | null };
  items: Array<{ id: string; medicineId: string; medicineName: string; strength: string | null; form: string | null; unit: string; quantity: number; remaining: number; dosageInstructions: string }>;

  constructor(record: PrescriptionRecord) {
    this.id = record.id;
    this.visitId = record.visitId;
    this.status = record.status === PrescriptionStatus.ISSUED && record.expiresAt && record.expiresAt < new Date() ? PrescriptionStatus.EXPIRED : record.status;
    this.issuedAt = record.issuedAt;
    this.expiresAt = record.expiresAt;
    this.cancelledAt = record.cancelledAt;
    this.replacesId = record.replacesId;
    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
    this.patient = { id: record.visit.patientId, fullName: record.visit.patient.fullName };
    this.doctor = { id: record.visit.doctorId, fullName: record.visit.doctor.fullName };
    this.items = record.items.map((item) => ({
      id: item.id, medicineId: item.medicineId, medicineName: item.medicineName,
      strength: item.strength, form: item.form, unit: item.unit, quantity: item.quantity,
      remaining: item.quantity - record.dispenses.filter((dispense) => dispense.status === 'COMPLETED').flatMap((dispense) => dispense.items).filter((line) => line.prescriptionItemId === item.id).reduce((sum, line) => sum + line.quantity, 0),
      dosageInstructions: item.dosageInstructions,
    }));
  }
}
