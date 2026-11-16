import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrescriptionStatus, Role, VisitStatus } from '@prisma/client';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../auth/prisma.service';
import { UserEntity } from '../auth/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionItemDto } from './dto/prescription-item.dto';
import { LookupPrescriptionDto } from './dto/lookup-prescription.dto';
import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import { PrescriptionEntity, PrescriptionRecord } from './entities/prescription.entity';

const include = { visit: { include: { patient: true, doctor: true } }, items: { include: { medicine: true } }, dispenses: { include: { items: true } } } as const;

@Injectable()
export class PrescriptionService {
  private readonly key: Buffer;

  constructor(private readonly prisma: PrismaService) {
    const dedicatedKey = process.env.PRESCRIPTION_ACCESS_KEY;
    if (dedicatedKey) {
      this.key = Buffer.from(dedicatedKey, 'base64');
      if (this.key.length !== 32) throw new Error('PRESCRIPTION_ACCESS_KEY must be a base64 encoded 32-byte key');
    } else {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) throw new Error('Set PRESCRIPTION_ACCESS_KEY or SUPABASE_SERVICE_ROLE_KEY');
      this.key = createHash('sha256').update('rxconnect-prescription-access-v1\0').update(serviceKey).digest();
    }
  }

  private hash(value: string): string { return createHmac('sha256', this.key).update(value).digest('hex'); }
  private encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
  }
  private decrypt(value: string): string {
    const data = Buffer.from(value, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.key, data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
  }
  private codeHash(code: string): string { return this.hash(code.replace(/[-\s]/g, '').toUpperCase()); }

  private async itemsData(items: PrescriptionItemDto[]) {
    const medicines = await this.prisma.medicine.findMany({ where: { id: { in: items.map((item) => item.medicineId) }, isActive: true } });
    if (medicines.length !== items.length) throw new BadRequestException('Every medicine must exist and be active');
    return items.map((item) => {
      const medicine = medicines.find((entry) => entry.id === item.medicineId)!;
      return { medicineId: medicine.id, quantity: item.quantity, dosageInstructions: item.dosageInstructions, medicineName: medicine.name, strength: medicine.strength, form: medicine.form, unit: medicine.unit };
    });
  }

  private async owned(id: string, actor: UserEntity): Promise<PrescriptionRecord> {
    const record = await this.prisma.prescription.findUniqueOrThrow({ where: { id }, include });
    if ((actor.role === Role.DOCTOR && record.visit.doctorId === actor.id) || (actor.role === Role.PATIENT && record.visit.patientId === actor.id)) return record;
    throw new NotFoundException('Prescription not found');
  }

  async create(doctorId: string, dto: CreatePrescriptionDto): Promise<PrescriptionEntity> {
    const visit = await this.prisma.visit.findUniqueOrThrow({ where: { id: dto.visitId, doctorId } });
    if (visit.status !== VisitStatus.IN_PROGRESS) throw new ConflictException('Visit must be in progress');
    if (dto.replacesId) {
      const previous = await this.prisma.prescription.findUniqueOrThrow({ where: { id: dto.replacesId } });
      if (previous.visitId !== dto.visitId || previous.status !== PrescriptionStatus.CANCELLED) throw new ConflictException('Replacement must refer to a cancelled prescription in this visit');
    }
    const data = await this.itemsData(dto.items);
    return new PrescriptionEntity(await this.prisma.prescription.create({ data: { visitId: dto.visitId, replacesId: dto.replacesId, items: { create: data } }, include }));
  }

  async findAll(actor: UserEntity): Promise<PrescriptionEntity[]> {
    const records = await this.prisma.prescription.findMany({ where: { visit: actor.role === Role.DOCTOR ? { doctorId: actor.id } : { patientId: actor.id } }, include, orderBy: { createdAt: 'desc' } });
    return records.map((record) => new PrescriptionEntity(record));
  }
  async findOne(actor: UserEntity, id: string): Promise<PrescriptionEntity> { return new PrescriptionEntity(await this.owned(id, actor)); }

  async update(doctorId: string, id: string, dto: UpdatePrescriptionDto): Promise<PrescriptionEntity> {
    const current = await this.owned(id, { id: doctorId, role: Role.DOCTOR } as UserEntity);
    if (current.status !== PrescriptionStatus.DRAFT || current.visit.status !== VisitStatus.IN_PROGRESS) throw new ConflictException('Only drafts from in-progress visits can be edited');
    const data = await this.itemsData(dto.items);
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.prescriptionItem.deleteMany({ where: { prescriptionId: id } });
      await tx.prescriptionItem.createMany({ data: data.map((item) => ({ ...item, prescriptionId: id })) });
      return tx.prescription.findUniqueOrThrow({ where: { id }, include });
    });
    return new PrescriptionEntity(record);
  }

  async remove(doctorId: string, id: string): Promise<void> {
    const current = await this.owned(id, { id: doctorId, role: Role.DOCTOR } as UserEntity);
    if (current.status !== PrescriptionStatus.DRAFT) throw new ConflictException('Only draft prescriptions can be deleted');
    await this.prisma.$transaction(async (tx) => {
      await tx.prescriptionItem.deleteMany({ where: { prescriptionId: id } });
      await tx.prescription.delete({ where: { id, status: PrescriptionStatus.DRAFT } });
    });
  }

  async issue(doctorId: string, id: string, expiresAt: string): Promise<PrescriptionEntity> {
    const expiry = new Date(expiresAt);
    if (expiry <= new Date()) throw new BadRequestException('Expiry must be in the future');
    const current = await this.owned(id, { id: doctorId, role: Role.DOCTOR } as UserEntity);
    if (current.status !== PrescriptionStatus.DRAFT || current.visit.status !== VisitStatus.IN_PROGRESS) throw new ConflictException('Only drafts from in-progress visits can be issued');
    const rawCode = randomBytes(10).toString('hex').toUpperCase();
    const qrToken = randomBytes(24).toString('base64url');
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.prescription.update({ where: { id, status: PrescriptionStatus.DRAFT }, data: { status: PrescriptionStatus.ISSUED, issuedAt: new Date(), expiresAt: expiry } });
      await tx.prescriptionAccess.create({ data: { prescriptionId: id, manualCodeHash: this.codeHash(rawCode), manualCodeEncrypted: this.encrypt(rawCode), qrTokenHash: this.hash(qrToken), qrTokenEncrypted: this.encrypt(qrToken), expiresAt: expiry } });
      return tx.prescription.findUniqueOrThrow({ where: { id }, include });
    });
    return new PrescriptionEntity(record);
  }

  async cancel(doctorId: string, id: string): Promise<PrescriptionEntity> {
    const current = await this.owned(id, { id: doctorId, role: Role.DOCTOR } as UserEntity);
    if (current.status !== PrescriptionStatus.DRAFT && current.status !== PrescriptionStatus.ISSUED) throw new ConflictException('Prescription cannot be cancelled');
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.prescription.update({ where: { id, status: current.status }, data: { status: PrescriptionStatus.CANCELLED, cancelledAt: new Date() } });
      await tx.prescriptionAccess.updateMany({ where: { prescriptionId: id, revokedAt: null }, data: { revokedAt: new Date() } });
      return tx.prescription.findUniqueOrThrow({ where: { id }, include });
    });
    return new PrescriptionEntity(record);
  }

  async access(actor: UserEntity, id: string) {
    const record = await this.owned(id, actor);
    if (record.status !== PrescriptionStatus.ISSUED || !record.expiresAt || record.expiresAt <= new Date()) throw new ConflictException('Prescription access is unavailable');
    const access = await this.prisma.prescriptionAccess.findFirstOrThrow({ where: { prescriptionId: id, revokedAt: null } });
    const code = this.decrypt(access.manualCodeEncrypted);
    const token = this.decrypt(access.qrTokenEncrypted);
    return { code: code.match(/.{1,4}/g)?.join('-'), qrToken: token, qrSvg: await QRCode.toString(token, { type: 'svg' }), expiresAt: access.expiresAt };
  }

  private async lookupAccess(dto: LookupPrescriptionDto, db: Prisma.TransactionClient | PrismaService = this.prisma) {
    if (Boolean(dto.code) === Boolean(dto.qrToken)) throw new BadRequestException('Provide either code or qrToken');
    const access = await db.prescriptionAccess.findFirst({ where: dto.code ? { manualCodeHash: this.codeHash(dto.code) } : { qrTokenHash: this.hash(dto.qrToken) }, include: { prescription: { include } } });
    if (!access || access.revokedAt || access.expiresAt <= new Date() || access.prescription.status !== PrescriptionStatus.ISSUED) throw new NotFoundException('Active prescription not found');
    return access;
  }

  async lookup(dto: LookupPrescriptionDto): Promise<PrescriptionEntity> { return new PrescriptionEntity((await this.lookupAccess(dto)).prescription); }

  async fills(actor: UserEntity, id: string) {
    await this.owned(id, actor);
    return this.prisma.dispense.findMany({ where: { prescriptionId: id }, include: { items: true, pharmacy: { select: { pharmacyName: true, address: true } } }, orderBy: { dispensedAt: 'desc' } });
  }

  async pharmacyDispenses(pharmacyId: string) {
    return this.prisma.dispense.findMany({ where: { pharmacyId }, include: { items: true, prescription: { select: { id: true, visit: { select: { patient: { select: { fullName: true } } } } } } }, orderBy: { dispensedAt: 'desc' } });
  }

  async pharmacies(actor: UserEntity, id: string) {
    const prescription = new PrescriptionEntity(await this.owned(id, actor));
    if (prescription.status !== PrescriptionStatus.ISSUED) throw new ConflictException('Prescription is not active');
    const remaining = prescription.items.filter((item) => item.remaining > 0);
    const stocks = await this.prisma.pharmacyStock.findMany({ where: { medicineId: { in: remaining.map((item) => item.medicineId) }, quantity: { gt: 0 } }, include: { pharmacy: true } });
    const pharmacies = [...new Set(stocks.map((stock) => stock.pharmacyId))].map((pharmacyId) => {
      const pharmacyStocks = stocks.filter((stock) => stock.pharmacyId === pharmacyId);
      return { pharmacyId, pharmacyName: pharmacyStocks[0].pharmacy.pharmacyName, address: pharmacyStocks[0].pharmacy.address, medicines: remaining.map((item) => ({ prescriptionItemId: item.id, medicineId: item.medicineId, remaining: item.remaining, available: pharmacyStocks.find((stock) => stock.medicineId === item.medicineId)?.quantity || 0 })) };
    });
    return pharmacies.map((pharmacy) => ({ ...pharmacy, canFillAll: pharmacy.medicines.every((item) => item.available >= item.remaining), availableItemCount: pharmacy.medicines.filter((item) => item.available > 0).length })).sort((a, b) => Number(b.canFillAll) - Number(a.canFillAll) || b.availableItemCount - a.availableItemCount);
  }

  async dispense(pharmacyId: string, id: string, dto: DispensePrescriptionDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Prescription" WHERE id = ${id}::uuid FOR UPDATE`;
      const access = await this.lookupAccess(dto, tx);
      if (access.prescriptionId !== id) throw new NotFoundException('Prescription not found');
      const record = await tx.prescription.findUniqueOrThrow({ where: { id }, include });
      const remaining = new PrescriptionEntity(record).items;
      for (const line of dto.items) {
        const item = remaining.find((entry) => entry.id === line.prescriptionItemId);
        if (!item || line.quantity > item.remaining) throw new ConflictException('Requested quantity exceeds prescription balance');
      }
      const dispense = await tx.dispense.create({ data: { prescriptionId: id, pharmacyId } });
      for (const line of dto.items) {
        const item = remaining.find((entry) => entry.id === line.prescriptionItemId)!;
        const stock = await tx.pharmacyStock.updateMany({ where: { pharmacyId, medicineId: item.medicineId, quantity: { gte: line.quantity } }, data: { quantity: { decrement: line.quantity } } });
        if (stock.count !== 1) throw new ConflictException('Insufficient pharmacy stock');
        const medicine = record.items.find((entry) => entry.id === item.id)!.medicine;
        const dispenseItem = await tx.dispenseItem.create({ data: { dispenseId: dispense.id, prescriptionId: id, prescriptionItemId: item.id, quantity: line.quantity, unitPrice: medicine.price, currency: medicine.currency, unit: item.unit } });
        await tx.stockMovement.create({ data: { pharmacyId, medicineId: item.medicineId, quantityDelta: -line.quantity, reason: 'DISPENSE', dispenseItemId: dispenseItem.id } });
      }
      return tx.dispense.findUniqueOrThrow({ where: { id: dispense.id }, include: { items: true } });
    }, { timeout: 10000 });
  }

  async reverse(pharmacyId: string, dispenseId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const found = await tx.dispense.findUniqueOrThrow({ where: { id: dispenseId } });
      await tx.$queryRaw`SELECT id FROM "Prescription" WHERE id = ${found.prescriptionId}::uuid FOR UPDATE`;
      const dispense = await tx.dispense.findUniqueOrThrow({ where: { id: dispenseId }, include: { items: { include: { prescriptionItem: true } } } });
      if (dispense.pharmacyId !== pharmacyId) throw new NotFoundException('Dispense not found');
      if (dispense.status !== 'COMPLETED') throw new ConflictException('Dispense already reversed');
      for (const item of dispense.items) {
        await tx.pharmacyStock.update({ where: { pharmacyId_medicineId: { pharmacyId, medicineId: item.prescriptionItem.medicineId } }, data: { quantity: { increment: item.quantity } } });
        await tx.stockMovement.create({ data: { pharmacyId, medicineId: item.prescriptionItem.medicineId, quantityDelta: item.quantity, reason: 'DISPENSE_REVERSAL', dispenseItemId: item.id } });
      }
      return tx.dispense.update({ where: { id: dispenseId, status: 'COMPLETED' }, data: { status: 'REVERSED', reversedAt: new Date(), reversalReason: reason }, include: { items: true } });
    }, { timeout: 10000 });
  }
}
