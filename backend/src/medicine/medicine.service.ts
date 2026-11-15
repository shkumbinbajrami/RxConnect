import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
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

  async findAll(actor: UserEntity): Promise<MedicineEntity[]> {
    const medicines = await this.prisma.medicine.findMany({
      where: actor.role === Role.ADMIN ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
    return medicines.map((medicine) => new MedicineEntity(medicine));
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
