import type { Medicine } from '@/features/medicine/types';

export type PharmacyStock = {
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  updatedAt: string;
  medicine: Medicine;
};
