export type Medicine = {
  id: string;
  name: string;
  strength: string | null;
  form: string | null;
  unit: string;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MedicineInput = {
  name: string;
  strength: string;
  form: string;
  unit: string;
  price: string;
  currency: string;
  isActive?: boolean;
};
