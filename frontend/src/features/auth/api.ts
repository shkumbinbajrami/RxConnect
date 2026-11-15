import { supabase } from '@/lib/supabase';
import { isRole, type Role } from '@/lib/roles';
import type { CurrentUser } from './types';

export const currentUserKey = ['auth', 'current-user'] as const;

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function getCurrentUser(accessToken?: string): Promise<CurrentUser> {
  const token = accessToken ?? (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) throw new AuthError('Please sign in to continue.', 401);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new AuthError(response.status === 403 ? 'This account is not verified.' : 'Your session has expired. Please sign in again.', response.status);
  }
  const user: CurrentUser = await response.json();
  if (!isRole(user.role) || !user.verified) throw new AuthError('This account is not available.', 403);
  return user;
}

export async function registerAccount(input: { email: string; password: string; role: Exclude<Role, 'ADMIN'> }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const result: { message?: string | string[] } = await response.json().catch(() => ({}));
    throw new AuthError(Array.isArray(result.message) ? result.message.join(', ') : result.message ?? 'Registration failed.', response.status);
  }
}
