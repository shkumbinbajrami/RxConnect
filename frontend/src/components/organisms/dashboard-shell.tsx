'use client';

import Link from 'next/link';
import { CalendarDays, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Pill, UserRound } from 'lucide-react';
import { useState } from 'react';
import { BrandMark } from '@/components/atoms/brand-mark';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Role } from '@/lib/roles';

const names: Record<Role, string> = { ADMIN: 'Admin', DOCTOR: 'Doctor', PHARMACY: 'Pharmacy', PATIENT: 'Patient' };
export type WorkspacePageName = 'Overview' | 'Profile' | 'Medicines' | 'Stock' | 'Visits' | 'Prescriptions';

export function DashboardShell({ role, email, page, onLogout, children }: {
  role: Role; email: string; page: WorkspacePageName; onLogout: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[#f5f8f6] text-slate-900 lg:grid lg:grid-cols-[256px_1fr]">
    <aside className={`${open ? 'block' : 'hidden'} border-r border-slate-200 bg-white p-6 lg:block lg:min-h-screen`}>
      <BrandMark />
      <p className="mt-12 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      <nav className="mt-4 space-y-1" aria-label="Primary navigation">
        <Link href={`/${role.toLowerCase()}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Overview' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard className="size-4" /> Overview</Link>
        <Link href={`/${role.toLowerCase()}/profile`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Profile' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><UserRound className="size-4" /> Profile</Link>
        {(role === 'DOCTOR' || role === 'PATIENT') && <Link href={`/${role.toLowerCase()}/visits`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Visits' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><CalendarDays className="size-4" /> Visits</Link>}
        {(role === 'PATIENT' || role === 'PHARMACY') && <Link href={`/${role.toLowerCase()}/prescriptions`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Prescriptions' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><ClipboardList className="size-4" /> Prescriptions</Link>}
        {role === 'ADMIN' && <Link href="/admin/medicines" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Medicines' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><Pill className="size-4" /> Medicines</Link>}
        {role === 'PHARMACY' && <Link href="/pharmacy/stock" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Stock' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><Package className="size-4" /> Stock</Link>}
      </nav>
      <div className="mt-10 rounded-2xl bg-[#102b27] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">Your workspace</p>
        <p className="mt-3 text-sm leading-6 text-emerald-50/80">A focused space for your care journey.</p>
      </div>
    </aside>
    <div className="min-w-0">
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu className="size-5" /></Button>
        <div className="hidden lg:block"><p className="text-xs text-slate-500">Workspace / {page}</p><p className="text-sm font-semibold">{names[role]} workspace</p></div>
        <div className="flex items-center gap-3"><Badge variant="secondary" className="hidden sm:inline-flex">{names[role]}</Badge><span className="hidden max-w-48 truncate text-sm text-slate-600 sm:inline">{email}</span><Button type="button" variant="outline" onClick={onLogout}><LogOut className="size-4" /> Sign out</Button></div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  </div>;
}
