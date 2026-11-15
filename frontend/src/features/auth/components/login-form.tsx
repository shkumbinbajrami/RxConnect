'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { AuthShell } from '@/components/organisms/auth-shell';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { rolePaths } from '@/lib/roles';
import { currentUserKey, getCurrentUser } from '../api';

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw new Error(error?.message ?? 'Unable to sign in.');
      try { return await getCurrentUser(data.session.access_token); }
      catch (error) { await supabase.auth.signOut(); throw error; }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserKey, user);
      router.replace(rolePaths[user.role]);
    },
  });

  return <AuthShell eyebrow="Welcome back" title="Sign in to RxConnect" description="Use your account to continue to your personal workspace." footer={<>New to RxConnect? <Link href="/register" className="font-semibold text-emerald-700 hover:underline">Create an account</Link></>}>
    <Card className="gap-0 border border-slate-200 bg-white py-0 shadow-lg shadow-slate-200/50 ring-0">
      <CardContent className="p-6 sm:p-8">
        <form className="space-y-5" onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          login.mutate({ email: String(values.get('email')), password: String(values.get('password')) });
        }}>
          <FormField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          <FormField label="Password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
          {login.isError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{login.error.message}</p>}
          <Button type="submit" size="lg" className="h-11 w-full bg-emerald-700 hover:bg-emerald-800" disabled={login.isPending}>
            {login.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <>Sign in <ArrowRight className="size-4" /></>}
          </Button>
        </form>
      </CardContent>
    </Card>
  </AuthShell>;
}
