import { supabase } from '@/lib/supabase';
import { AuthError } from '@/features/auth/api';
import type { CurrentUser } from '@/features/auth/types';

export type ProfileInput = Record<string, string>;

export async function changePassword(input: { currentPassword: string; newPassword: string; nonce?: string }) {
  const { error } = await supabase.auth.updateUser({ current_password: input.currentPassword, password: input.newPassword, ...(input.nonce && { nonce: input.nonce }) });
  if (error) throw error;
}

export async function requestPasswordReauthentication() {
  const { error } = await supabase.auth.reauthenticate();
  if (error) throw error;
}

export async function updateProfile(input: ProfileInput): Promise<CurrentUser> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) throw new AuthError('Please sign in again.', 401);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const result: { message?: string | string[] } = await response.json().catch(() => ({}));
    const message = Array.isArray(result.message) ? result.message.join(', ') : result.message;
    throw new AuthError(message ?? 'Unable to save profile.', response.status);
  }
  return response.json();
}
