import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, VisitStatus } from '@prisma/client';
import { PrismaService } from '../auth/prisma.service';
import { UserEntity } from '../auth/entities/user.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitEntity } from './entities/visit.entity';

const people = { doctor: true, patient: true } as const;

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}

  async findPatient(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Enter a valid patient email');
    const patient = await this.prisma.user.findFirst({ where: { email: email.trim().toLowerCase(), role: Role.PATIENT, verified: true }, select: { id: true, email: true, patientProfile: { select: { fullName: true } } } });
    if (!patient) throw new NotFoundException('No verified patient found with that email');
    return { id: patient.id, email: patient.email, fullName: patient.patientProfile?.fullName ?? null };
  }

  async create(doctorId: string, dto: CreateVisitDto): Promise<VisitEntity> {
    const visit = await this.prisma.visit.create({
      data: {
        doctor: { connect: { userId: doctorId } },
        patient: { connect: { userId: dto.patientId } },
        status: dto.scheduledAt ? VisitStatus.PLANNED : VisitStatus.IN_PROGRESS,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        startedAt: dto.scheduledAt ? null : new Date(),
        notes: dto.notes,
      },
      include: people,
    });
    return new VisitEntity(visit);
  }

  async findAll(actor: UserEntity): Promise<VisitEntity[]> {
    const visits = await this.prisma.visit.findMany({
      where: actor.role === Role.DOCTOR ? { doctorId: actor.id } : { patientId: actor.id },
      include: people,
      orderBy: { createdAt: 'desc' },
    });
    return visits.map((visit) => new VisitEntity(visit, actor.role === Role.DOCTOR));
  }

  async findOne(actor: UserEntity, id: string): Promise<VisitEntity> {
    const visit = await this.prisma.visit.findUniqueOrThrow({
      where: { id, ...(actor.role === Role.DOCTOR ? { doctorId: actor.id } : { patientId: actor.id }) },
      include: people,
    });
    return new VisitEntity(visit, actor.role === Role.DOCTOR);
  }

  async update(doctorId: string, id: string, dto: UpdateVisitDto): Promise<VisitEntity> {
    const current = await this.prisma.visit.findUniqueOrThrow({ where: { id, doctorId } });
    if (current.status !== VisitStatus.PLANNED && current.status !== VisitStatus.IN_PROGRESS) {
      throw new ConflictException('This visit can no longer be edited');
    }
    if (dto.scheduledAt !== undefined && current.status !== VisitStatus.PLANNED) {
      throw new ConflictException('Only planned visits can change their schedule');
    }
    const visit = await this.prisma.visit.update({
      where: { id, doctorId, status: current.status },
      data: {
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }),
      },
      include: people,
    });
    return new VisitEntity(visit);
  }

  async start(doctorId: string, id: string): Promise<VisitEntity> {
    return this.transition(doctorId, id, VisitStatus.PLANNED, VisitStatus.IN_PROGRESS, { startedAt: new Date() });
  }

  async complete(doctorId: string, id: string): Promise<VisitEntity> {
    const current = await this.prisma.visit.findUniqueOrThrow({ where: { id, doctorId } });
    if (current.status !== VisitStatus.IN_PROGRESS) throw new ConflictException('Only an in-progress visit can be completed');
    const drafts = await this.prisma.prescription.count({ where: { visitId: id, visit: { doctorId }, status: 'DRAFT' } });
    if (drafts > 0) throw new ConflictException('Issue or remove draft prescriptions before completing this visit');
    return this.transition(doctorId, id, VisitStatus.IN_PROGRESS, VisitStatus.COMPLETED, { endedAt: new Date() });
  }

  async cancel(doctorId: string, id: string): Promise<VisitEntity> {
    return this.transition(doctorId, id, VisitStatus.PLANNED, VisitStatus.CANCELLED, { endedAt: new Date() });
  }

  async discontinue(doctorId: string, id: string): Promise<VisitEntity> {
    return this.transition(doctorId, id, VisitStatus.IN_PROGRESS, VisitStatus.DISCONTINUED, { endedAt: new Date() });
  }

  async remove(doctorId: string, id: string): Promise<VisitEntity> {
    const current = await this.prisma.visit.findUniqueOrThrow({ where: { id, doctorId }, include: people });
    if (current.status !== VisitStatus.PLANNED) throw new ConflictException('Only planned visits can be deleted');
    const visit = await this.prisma.visit.delete({ where: { id, doctorId, status: VisitStatus.PLANNED }, include: people });
    return new VisitEntity(visit);
  }

  private async transition(doctorId: string, id: string, from: VisitStatus, to: VisitStatus, dates: { startedAt?: Date; endedAt?: Date }): Promise<VisitEntity> {
    const current = await this.prisma.visit.findUniqueOrThrow({ where: { id, doctorId } });
    if (current.status !== from) throw new ConflictException(`Visit must be ${from.toLowerCase()} for this action`);
    const visit = await this.prisma.visit.update({
      where: { id, doctorId, status: from }, data: { status: to, ...dates }, include: people,
    });
    return new VisitEntity(visit);
  }
}
