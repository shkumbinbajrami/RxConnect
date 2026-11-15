export type Role = 'ADMIN' | 'DOCTOR' | 'PHARMACY' | 'PATIENT';

export const rolePaths: Record<Role, string> = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  PHARMACY: '/pharmacy',
  PATIENT: '/patient',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in rolePaths;
}
