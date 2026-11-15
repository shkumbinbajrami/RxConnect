import { supabase } from '@/lib/supabase';
import { AuthError } from '@/features/auth/api';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) throw new AuthError('Please sign in to continue.', 401);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const result: { message?: string | string[] } = await response.json().catch(() => ({}));
    const message = Array.isArray(result.message) ? result.message.join(', ') : result.message;
    throw new AuthError(message ?? 'Request failed. Please try again.', response.status);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
  return response.json();
}
