'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, ClipboardList, Package, Pill, ShieldCheck, UserRound } from 'lucide-react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { ProfileDetail } from '@/components/molecules/profile-detail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Role } from '@/lib/roles';
import type { CurrentUser } from '@/features/auth/types';
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';
import { searchVisits, visitKeys } from '@/features/visit/api';
import { searchPrescriptions, prescriptionKeys } from '@/features/prescription/api';
import { searchStock, stockKeys } from '@/features/pharmacy-stock/api';
import { searchMedicines, medicineKeys } from '@/features/medicine/api';

const content: Record<Role, { title: string; description: string }> = {
  ADMIN: { title: 'Welcome to your admin workspace', description: 'Your account and access details are ready in one place.' },
  DOCTOR: { title: 'Welcome to your doctor workspace', description: 'Your professional details and care workspace, together.' },
  PHARMACY: { title: 'Welcome to your pharmacy workspace', description: 'Your pharmacy details and care workspace, together.' },
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

function OverviewNextStep({ role, userId }: { role: Role; userId: string }) {
  const doctor = useQuery({ queryKey: [...visitKeys.list(userId), 'overview-planned'], queryFn: () => searchVisits({ page: 1, limit: 1, status: 'PLANNED' }), enabled: role === 'DOCTOR' });
  const patient = useQuery({ queryKey: [...prescriptionKeys.list(userId), 'overview-issued'], queryFn: () => searchPrescriptions({ page: 1, limit: 1, status: 'ISSUED' }), enabled: role === 'PATIENT' });
  const pharmacy = useQuery({ queryKey: [...stockKeys.list(userId), 'overview-empty'], queryFn: () => searchStock({ page: 1, limit: 1, inStock: false }), enabled: role === 'PHARMACY' });
  const admin = useQuery({ queryKey: [...medicineKeys.list('admin'), 'overview'], queryFn: () => searchMedicines({ page: 1, limit: 1 }), enabled: role === 'ADMIN' });
  const query = role === 'DOCTOR' ? doctor : role === 'PATIENT' ? patient : role === 'PHARMACY' ? pharmacy : admin;
  const detail = role === 'DOCTOR' ? 'planned visits' : role === 'PATIENT' ? 'active prescriptions' : role === 'PHARMACY' ? 'medicines out of stock' : 'medicines in the catalog';
  const href = role === 'DOCTOR' ? '/doctor/visits' : role === 'PATIENT' ? '/patient/prescriptions' : role === 'PHARMACY' ? '/pharmacy/stock' : '/admin/medicines';
  return <Card className="border border-emerald-200 bg-emerald-50/70 shadow-sm ring-0 md:col-span-2"><CardHeader><CardTitle className="text-lg">At a glance</CardTitle><CardDescription>{role === 'PHARMACY' ? 'Keep your stock ready for prescription fills.' : role === 'DOCTOR' ? 'Review your upcoming work.' : role === 'PATIENT' ? 'See prescriptions ready to collect.' : 'Review the shared catalog.'}</CardDescription></CardHeader><CardContent className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-3xl font-semibold tabular-nums text-emerald-900">{query.isPending || query.isError ? '—' : query.data.total}</p><p className="mt-1 text-sm text-emerald-900/75">{detail}</p></div><Button render={<Link href={href} />} variant="outline" className="border-emerald-200 bg-white">{role === 'PHARMACY' ? 'Review stock' : role === 'DOCTOR' ? 'Open visits' : role === 'PATIENT' ? 'View prescriptions' : 'Open catalog'} <ArrowRight className="size-4" /></Button>{query.isError && <p className="w-full text-sm text-red-700">Could not load this summary.</p>}</CardContent></Card>;
}

export function RoleHome({ role, page = 'overview' }: { role: Role; page?: 'overview' | 'profile' }) {
  return <WorkspacePage role={role} page={page === 'profile' ? 'Profile' : 'Overview'}>{(user) => <RoleHomeContent role={role} page={page} user={user} />}</WorkspacePage>;
}

function RoleHomeContent({ role, page, user }: { role: Role; page: 'overview' | 'profile'; user: CurrentUser }) {
  const [editing, setEditing] = useState(false);

  const profile = role === 'DOCTOR' ? user.doctorProfile : role === 'PHARMACY' ? user.pharmacyProfile : role === 'PATIENT' ? user.patientProfile : null;
  const fields = profile ? Object.entries(profile).filter(([key]) => key !== 'userId') : [];
  const filled = fields.filter(([, value]) => value).length;

  return <>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{page}</p><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{page === 'profile' ? 'Your profile' : content[role].title}</h1><p className="mt-3 text-slate-600">{page === 'profile' ? 'View and update the details connected to your account.' : content[role].description}</p></div>
    </div>
    {page === 'overview' ? <div className="mt-9 grid gap-5 md:grid-cols-2">
      <OverviewNextStep role={role} userId={user.id} />
      <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserRound className="size-5 text-emerald-700" /> Your profile</CardTitle><CardDescription>{role === 'ADMIN' ? 'Your administrator account details.' : `${filled} of ${fields.length} details provided`}</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600">{role === 'ADMIN' ? 'View your account and access status.' : filled === fields.length ? 'Your profile details are complete. You can review or update them at any time.' : 'Complete your profile to keep your account details up to date.'}</p><Button className="mt-6 bg-emerald-700 hover:bg-emerald-800" render={<Link href={`/${role.toLowerCase()}/profile`} />}>View profile <ArrowRight className="size-4" /></Button></CardContent></Card>
      <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="size-5 text-emerald-700" /> Account status</CardTitle><CardDescription>Your access to RxConnect</CardDescription></CardHeader><CardContent><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge><p className="mt-4 break-all text-sm text-slate-600">{user.email}</p></CardContent></Card>
      {role === 'ADMIN' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Pill className="size-5 text-emerald-700" /> Medicine catalog</CardTitle><CardDescription>Manage shared medicines and prices.</CardDescription></CardHeader><CardContent><Button render={<Link href="/admin/medicines" />} variant="outline">Open catalog <ArrowRight className="size-4" /></Button></CardContent></Card>}
      {role === 'PHARMACY' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="size-5 text-emerald-700" /> Your stock</CardTitle><CardDescription>Record and update medicine quantities.</CardDescription></CardHeader><CardContent><Button render={<Link href="/pharmacy/stock" />} variant="outline">Manage stock <ArrowRight className="size-4" /></Button></CardContent></Card>}
      {role === 'DOCTOR' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="size-5 text-emerald-700" /> Visits</CardTitle><CardDescription>Manage appointments and care notes.</CardDescription></CardHeader><CardContent><Button render={<Link href="/doctor/visits" />} variant="outline">Open visits <ArrowRight className="size-4" /></Button></CardContent></Card>}
      {role === 'DOCTOR' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="size-5 text-emerald-700" /> Prescriptions</CardTitle><CardDescription>Write, issue, and manage prescriptions.</CardDescription></CardHeader><CardContent><Button render={<Link href="/doctor/prescriptions" />} variant="outline">Open prescriptions <ArrowRight className="size-4" /></Button></CardContent></Card>}
      {role === 'PATIENT' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="size-5 text-emerald-700" /> Your prescriptions</CardTitle><CardDescription>View codes and find pharmacies with your medicines.</CardDescription></CardHeader><CardContent><Button render={<Link href="/patient/prescriptions" />} variant="outline">View prescriptions <ArrowRight className="size-4" /></Button></CardContent></Card>}
      {role === 'PHARMACY' && <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="size-5 text-emerald-700" /> Fill prescriptions</CardTitle><CardDescription>Look up codes, scan QR, and record partial fills.</CardDescription></CardHeader><CardContent><Button render={<Link href="/pharmacy/prescriptions" />} variant="outline">Open prescriptions <ArrowRight className="size-4" /></Button></CardContent></Card>}
    </div> :
    <div className="mt-9 grid gap-5 md:grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)]">
      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="text-lg">Profile details</CardTitle><div className="flex items-center gap-3"><Badge variant="secondary">{role.toLowerCase()}</Badge>{role !== 'ADMIN' && !editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>{filled === fields.length ? 'Edit profile' : 'Complete profile'}</Button>}</div></div><CardDescription>{editing ? 'Add or update your details below.' : 'Information associated with your account.'}</CardDescription></CardHeader>
        <CardContent>{role !== 'ADMIN' && editing ? <ProfileForm role={role} profile={profile} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} /> : fields.length ? <dl className="grid gap-3 sm:grid-cols-2">{fields.map(([key, value]) => <ProfileDetail key={key} label={labels[key] ?? key} value={displayProfileValue(key, value)} />)}</dl> : <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">Your admin account is ready.</div>}</CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="size-5 text-emerald-700" /> Account status</CardTitle></CardHeader><CardContent><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge><p className="mt-4 break-all text-sm text-slate-600">{user.email}</p></CardContent></Card>
        <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="text-lg">Change password</CardTitle><CardDescription>Update the password you use to sign in.</CardDescription></CardHeader><CardContent><ChangePasswordForm /></CardContent></Card>
        {fields.length > 0 && <Card className="border border-emerald-200 bg-emerald-50/70 shadow-sm ring-0"><CardHeader><CardTitle className="text-base">Profile progress</CardTitle><CardDescription>{filled} of {fields.length} details provided</CardDescription></CardHeader><CardContent><div className="h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round(filled / fields.length * 100)}%` }} /></div></CardContent></Card>}
      </div>
    </div>}
  </>;
}
