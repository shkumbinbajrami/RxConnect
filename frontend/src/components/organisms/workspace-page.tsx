'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthError, currentUserKey } from '@/features/auth/api';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import type { CurrentUser } from '@/features/auth/types';
import { rolePaths, type Role } from '@/lib/roles';
import { supabase } from '@/lib/supabase';
import { DashboardShell, type WorkspacePageName } from './dashboard-shell';

export function WorkspacePage({ role, page, children }: {
  role: Role;
  page: WorkspacePageName;
  children: (user: CurrentUser, controls: { refresh: () => void; isFetching: boolean }) => React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, error, isPending, isFetching, refetch } = useCurrentUser();

  useEffect(() => {
    if (user && user.role !== role) router.replace(rolePaths[user.role]);
    if (error instanceof AuthError && (error.status === 401 || error.status === 403)) router.replace('/login');
  }, [user, error, role, router]);

  async function logout() {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: currentUserKey });
    router.replace('/login');
  }

  if (isPending || (user && user.role !== role) || (error instanceof AuthError && (error.status === 401 || error.status === 403))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f8f6] text-sm text-slate-600">Loading your workspace…</main>;
  }
  if (error || !user) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f8f6] p-6 text-center"><h1 className="text-xl font-semibold">We couldn’t load your workspace</h1><p className="text-sm text-slate-600">Check your connection and try again.</p><Button onClick={() => void refetch()}><RefreshCcw className="size-4" /> Try again</Button></main>;

  return <DashboardShell role={role} email={user.email} page={page} onLogout={() => void logout()}>{children(user, { refresh: () => void refetch(), isFetching })}</DashboardShell>;
}
