'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, RefreshCcw, ShieldCheck, UserRound } from 'lucide-react';
import { DashboardShell } from '@/components/organisms/dashboard-shell';
import { ProfileDetail } from '@/components/molecules/profile-detail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { rolePaths, type Role } from '@/lib/roles';
import { AuthError, currentUserKey } from '@/features/auth/api';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ProfileForm } from './profile-form';

const content: Record<Role, { title: string; description: string }> = {
  ADMIN: { title: 'Welcome to your admin workspace', description: 'Your account and access details are ready in one place.' },
  DOCTOR: { title: 'Welcome to your doctor workspace', description: 'Your professional details and care workspace, together.' },
  FARMACY: { title: 'Welcome to your farmacy workspace', description: 'Your pharmacy details and care workspace, together.' },
  PATIENT: { title: 'Welcome to your patient workspace', description: 'Your personal details and care workspace, together.' },
};

const labels: Record<string, string> = {
  fullName: 'Full name', specialty: 'Specialty', licenseNumber: 'License number',
  workplace: 'Workplace', pharmacyName: 'Pharmacy name', address: 'Address',
  phone: 'Phone', dateOfBirth: 'Date of birth',
};

function displayProfileValue(key: string, value: string | null) {
  if (key !== 'dateOfBirth' || !value) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function RoleHome({ role, page = 'overview' }: { role: Role; page?: 'overview' | 'profile' }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data: user, error, isPending, refetch, isFetching } = useCurrentUser();

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

  const profile = role === 'DOCTOR' ? user.doctorProfile : role === 'FARMACY' ? user.farmacyProfile : role === 'PATIENT' ? user.patientProfile : null;
  const fields = profile ? Object.entries(profile).filter(([key]) => key !== 'userId') : [];
  const filled = fields.filter(([, value]) => value).length;

  return <DashboardShell role={role} email={user.email} page={page === 'profile' ? 'Profile' : 'Overview'} onLogout={() => void logout()}>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{page}</p><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{page === 'profile' ? 'Your profile' : content[role].title}</h1><p className="mt-3 text-slate-600">{page === 'profile' ? 'View and update the details connected to your account.' : content[role].description}</p></div>
      <Button type="button" variant="outline" onClick={() => void refetch()} disabled={isFetching}><RefreshCcw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh</Button>
    </div>
    {page === 'overview' ? <div className="mt-9 grid gap-5 md:grid-cols-2">
      <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserRound className="size-5 text-emerald-700" /> Your profile</CardTitle><CardDescription>{role === 'ADMIN' ? 'Your administrator account details.' : `${filled} of ${fields.length} details provided`}</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600">{role === 'ADMIN' ? 'View your account and access status.' : filled === fields.length ? 'Your profile details are complete. You can review or update them at any time.' : 'Complete your profile to keep your account details up to date.'}</p><Button className="mt-6 bg-emerald-700 hover:bg-emerald-800" render={<Link href={`/${role.toLowerCase()}/profile`} />}>View profile <ArrowRight className="size-4" /></Button></CardContent></Card>
      <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="size-5 text-emerald-700" /> Account status</CardTitle><CardDescription>Your access to RxConnect</CardDescription></CardHeader><CardContent><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge><p className="mt-4 break-all text-sm text-slate-600">{user.email}</p></CardContent></Card>
    </div> :
    <div className="mt-9 grid gap-5 md:grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)]">
      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="text-lg">Profile details</CardTitle><div className="flex items-center gap-3"><Badge variant="secondary">{role.toLowerCase()}</Badge>{role !== 'ADMIN' && !editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>{filled === fields.length ? 'Edit profile' : 'Complete profile'}</Button>}</div></div><CardDescription>{editing ? 'Add or update your details below.' : 'Information associated with your account.'}</CardDescription></CardHeader>
        <CardContent>{role !== 'ADMIN' && editing ? <ProfileForm role={role} profile={profile} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} /> : fields.length ? <dl className="grid gap-3 sm:grid-cols-2">{fields.map(([key, value]) => <ProfileDetail key={key} label={labels[key] ?? key} value={displayProfileValue(key, value)} />)}</dl> : <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">Your admin account is ready.</div>}</CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="size-5 text-emerald-700" /> Account status</CardTitle></CardHeader><CardContent><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge><p className="mt-4 break-all text-sm text-slate-600">{user.email}</p></CardContent></Card>
        {fields.length > 0 && <Card className="border border-emerald-200 bg-emerald-50/70 shadow-sm ring-0"><CardHeader><CardTitle className="text-base">Profile progress</CardTitle><CardDescription>{filled} of {fields.length} details provided</CardDescription></CardHeader><CardContent><div className="h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round(filled / fields.length * 100)}%` }} /></div></CardContent></Card>}
      </div>
    </div>}
  </DashboardShell>;
}
