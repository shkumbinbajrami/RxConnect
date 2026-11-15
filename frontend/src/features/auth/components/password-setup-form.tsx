'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthShell } from '@/components/organisms/auth-shell';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { currentUserKey } from '../api';

export function PasswordSetupForm({ onComplete }: { onComplete: () => void }) {
  const queryClient = useQueryClient();
  const setup = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      queryClient.removeQueries({ queryKey: currentUserKey });
    },
    onSuccess: () => { window.history.replaceState(null, '', '/login'); onComplete(); },
  });
  return <AuthShell eyebrow="One last step" title="Set your password" description="Choose a password for your invited account." footer={<Link href="/login" className="font-semibold text-emerald-700 hover:underline">Back to sign in</Link>}>
    <Card className="border border-slate-200 bg-white py-0 shadow-lg shadow-slate-200/50 ring-0"><CardContent className="p-6 sm:p-8"><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); setup.mutate(String(new FormData(event.currentTarget).get('password'))); }}>
      <FormField label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
      {setup.isError && <p role="alert" className="text-sm text-red-700">{setup.error.message}</p>}
      <Button type="submit" className="h-11 w-full bg-emerald-700" disabled={setup.isPending}>Save password</Button>
    </form></CardContent></Card>
  </AuthShell>;
}
