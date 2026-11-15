import type { Medicine } from '@prisma/client';

export class MedicineEntity {
  id: string;
  name: string;
  strength: string | null;
  form: string | null;
  unit: string;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(medicine: Medicine) {
    this.id = medicine.id;
    this.name = medicine.name;
    this.strength = medicine.strength;
    this.form = medicine.form;
    this.unit = medicine.unit;
    this.price = medicine.price.toFixed(2);
    this.currency = medicine.currency;
    this.isActive = medicine.isActive;
    this.createdAt = medicine.createdAt;
    this.updatedAt = medicine.updatedAt;
  }
}
