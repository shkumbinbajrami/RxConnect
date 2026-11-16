import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ListResult, listResult, pagination } from '../common/dto/list-query.dto';
import { ListStockDto } from './dto/list-stock.dto';
import { PrismaService } from '../auth/prisma.service';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PharmacyStockEntity } from './entities/pharmacy-stock.entity';

@Injectable()
export class PharmacyStockService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pharmacyId: string, query: ListStockDto): Promise<ListResult<PharmacyStockEntity>> {
    const search = query.search?.trim();
    const where: Prisma.PharmacyStockWhereInput = {
      pharmacyId,
      ...(query.inStock !== undefined && { quantity: query.inStock ? { gt: 0 } : 0 }),
      ...(search && { medicine: { OR: ['name', 'strength', 'form'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } }),
    };
    const paging = pagination(query);
    const [stock, total] = await Promise.all([this.prisma.pharmacyStock.findMany({
      where,
      include: { medicine: true },
      orderBy: [{ medicine: { name: 'asc' } }, { medicineId: 'asc' }],
      ...(paging.enabled && { skip: paging.skip, take: paging.limit }),
    }), paging.enabled ? this.prisma.pharmacyStock.count({ where }) : Promise.resolve(0)]);
    return listResult(stock.map((item) => new PharmacyStockEntity(item)), total, query);
  }

  async findOne(pharmacyId: string, medicineId: string): Promise<PharmacyStockEntity> {
    const stock = await this.prisma.pharmacyStock.findUniqueOrThrow({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
      include: { medicine: true },
    });
    return new PharmacyStockEntity(stock);
  }

  async add(pharmacyId: string, dto: AddStockDto): Promise<PharmacyStockEntity> {
    const stock = await this.prisma.$transaction(async (tx) => {
      const created = await tx.pharmacyStock.create({
        data: {
          quantity: dto.quantity,
          pharmacy: { connect: { userId: pharmacyId } },
          medicine: { connect: { id: dto.medicineId, isActive: true } },
        },
        include: { medicine: true },
      });
      if (dto.quantity > 0) await tx.stockMovement.create({ data: { pharmacyId, medicineId: dto.medicineId, quantityDelta: dto.quantity, reason: 'RECEIPT' } });
      return created;
    });
    return new PharmacyStockEntity(stock);
  }

  async update(pharmacyId: string, medicineId: string, dto: UpdateStockDto): Promise<PharmacyStockEntity> {
    const stock = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "pharmacyId" FROM "PharmacyStock" WHERE "pharmacyId" = ${pharmacyId}::uuid AND "medicineId" = ${medicineId}::uuid FOR UPDATE`;
      const previous = await tx.pharmacyStock.findUniqueOrThrow({ where: { pharmacyId_medicineId: { pharmacyId, medicineId } } });
      const updated = await tx.pharmacyStock.update({ where: { pharmacyId_medicineId: { pharmacyId, medicineId } }, data: { quantity: dto.quantity }, include: { medicine: true } });
      const delta = dto.quantity - previous.quantity;
      if (delta !== 0) await tx.stockMovement.create({ data: { pharmacyId, medicineId, quantityDelta: delta, reason: 'ADJUSTMENT' } });
      return updated;
    });
    return new PharmacyStockEntity(stock);
  }

  async remove(pharmacyId: string, medicineId: string): Promise<PharmacyStockEntity> {
    const stock = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "pharmacyId" FROM "PharmacyStock" WHERE "pharmacyId" = ${pharmacyId}::uuid AND "medicineId" = ${medicineId}::uuid FOR UPDATE`;
      const deleted = await tx.pharmacyStock.delete({ where: { pharmacyId_medicineId: { pharmacyId, medicineId } }, include: { medicine: true } });
      if (deleted.quantity > 0) await tx.stockMovement.create({ data: { pharmacyId, medicineId, quantityDelta: -deleted.quantity, reason: 'ADJUSTMENT' } });
      return deleted;
    });
    return new PharmacyStockEntity(stock);
  }
}
