import type { Role } from '@/lib/roles';

export type Profile = Record<string, string | null>;

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  verified: boolean;
  doctorProfile: Profile | null;
  pharmacyProfile: Profile | null;
  patientProfile: Profile | null;
};
