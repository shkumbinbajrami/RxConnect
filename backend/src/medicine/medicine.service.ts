import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { ListResult, listResult, pagination } from '../common/dto/list-query.dto';
import { ListMedicinesDto } from './dto/list-medicines.dto';
import { PrismaService } from '../auth/prisma.service';
import { UserEntity } from '../auth/entities/user.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineEntity } from './entities/medicine.entity';

@Injectable()
export class MedicineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicineDto): Promise<MedicineEntity> {
    const medicine = await this.prisma.medicine.create({ data: dto });
    return new MedicineEntity(medicine);
  }

  async findAll(actor: UserEntity, query: ListMedicinesDto): Promise<ListResult<MedicineEntity>> {
    const search = query.search?.trim();
    const where: Prisma.MedicineWhereInput = {
      ...(actor.role === Role.ADMIN ? (query.isActive !== undefined ? { isActive: query.isActive } : {}) : { isActive: true }),
      ...(search && { OR: ['name', 'strength', 'form', 'unit'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) }),
    };
    const paging = pagination(query);
    const [medicines, total] = await Promise.all([this.prisma.medicine.findMany({
      where,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      ...(paging.enabled && { skip: paging.skip, take: paging.limit }),
    }), paging.enabled ? this.prisma.medicine.count({ where }) : Promise.resolve(0)]);
    return listResult(medicines.map((medicine) => new MedicineEntity(medicine)), total, query);
  }

  async findOne(actor: UserEntity, id: string): Promise<MedicineEntity> {
    const medicine = await this.prisma.medicine.findUniqueOrThrow({
      where: { id, ...(actor.role === Role.ADMIN ? {} : { isActive: true }) },
    });
    return new MedicineEntity(medicine);
  }

  async update(id: string, dto: UpdateMedicineDto): Promise<MedicineEntity> {
    const medicine = await this.prisma.medicine.update({ where: { id }, data: dto });
    return new MedicineEntity(medicine);
  }

  async remove(id: string): Promise<MedicineEntity> {
    const medicine = await this.prisma.medicine.delete({ where: { id } });
    return new MedicineEntity(medicine);
  }
}
