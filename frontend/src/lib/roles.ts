export type Role = 'ADMIN' | 'DOCTOR' | 'FARMACY' | 'PATIENT';

export const rolePaths: Record<Role, string> = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  FARMACY: '/farmacy',
  PATIENT: '/patient',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in rolePaths;
}
