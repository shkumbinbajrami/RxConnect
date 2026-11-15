import { Prisma } from '@prisma/client';
import { MedicineEntity } from '../../medicine/entities/medicine.entity';

type StockWithMedicine = Prisma.PharmacyStockGetPayload<{ include: { medicine: true } }>;

export class PharmacyStockEntity {
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  updatedAt: Date;
  medicine: MedicineEntity;

  constructor(stock: StockWithMedicine) {
    this.pharmacyId = stock.pharmacyId;
    this.medicineId = stock.medicineId;
    this.quantity = stock.quantity;
    this.updatedAt = stock.updatedAt;
    this.medicine = new MedicineEntity(stock.medicine);
  }
}
