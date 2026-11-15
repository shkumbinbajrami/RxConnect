'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { AuthShell } from '@/components/organisms/auth-shell';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerAccount } from '../api';
import type { Role } from '@/lib/roles';

type PublicRole = Exclude<Role, 'ADMIN'>;

export function RegisterForm() {
  const [role, setRole] = useState<PublicRole>('PATIENT');
  const register = useMutation({ mutationFn: registerAccount });

  return <AuthShell eyebrow="Join RxConnect" title="Create your account" description="Choose how you’ll use RxConnect. You can complete your profile after signing in." footer={<>Already have an account? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link></>}>
    <Card className="gap-0 border border-slate-200 bg-white py-0 shadow-lg shadow-slate-200/50 ring-0">
      <CardContent className="p-6 sm:p-8">
        {register.isSuccess ? <div role="status" className="space-y-4 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div><h2 className="text-xl font-semibold">Your account is ready</h2><p className="text-sm text-slate-600">You can now sign in to your workspace.</p><Button render={<Link href="/login" />} className="w-full bg-emerald-700">Go to sign in</Button></div> :
        <form className="space-y-5" onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          register.mutate({ email: String(values.get('email')), password: String(values.get('password')), role });
        }}>
          <div className="space-y-2"><Label htmlFor="role">I’m joining as</Label><Select value={role} onValueChange={(value) => { if (value) setRole(value as PublicRole); }}><SelectTrigger id="role" className="h-11 w-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PATIENT">Patient</SelectItem><SelectItem value="DOCTOR">Doctor</SelectItem><SelectItem value="FARMACY">Farmacy</SelectItem></SelectContent></Select></div>
          <FormField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          <FormField label="Password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" minLength={8} required hint="At least 8 characters." />
          {register.isError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{register.error.message}</p>}
          <Button type="submit" size="lg" className="h-11 w-full bg-emerald-700 hover:bg-emerald-800" disabled={register.isPending}>
            {register.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <>Create account <ArrowRight className="size-4" /></>}
          </Button>
        </form>}
      </CardContent>
    </Card>
  </AuthShell>;
}
