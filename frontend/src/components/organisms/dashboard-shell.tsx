'use client';

import Link from 'next/link';
import { CalendarDays, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Pill, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/atoms/brand-mark';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Role } from '@/lib/roles';

const names: Record<Role, string> = { ADMIN: 'Admin', DOCTOR: 'Doctor', PHARMACY: 'Pharmacy', PATIENT: 'Patient' };
export type WorkspacePageName = 'Overview' | 'Profile' | 'Medicines' | 'Stock' | 'Visits' | 'Prescriptions';

export function DashboardShell({ role, email, page, onLogout, children }: {
  role: Role; email: string; page: WorkspacePageName; onLogout: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return <div className="min-h-screen bg-[#f5f8f6] text-slate-900 lg:grid lg:grid-cols-[256px_1fr]">
    {open && <button type="button" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <aside id="workspace-navigation" className={`${open ? 'visible translate-x-0' : 'invisible -translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-slate-200 bg-white p-6 shadow-xl transition-transform lg:visible lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none`}>
      <button type="button" className="absolute right-4 top-5 flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-5" /></button>
      <BrandMark />
      <p className="mt-12 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      <nav className="mt-4 space-y-1" aria-label="Primary navigation" onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setOpen(false); }}>
        <Link href={`/${role.toLowerCase()}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Overview' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard className="size-4" /> Overview</Link>
        <Link href={`/${role.toLowerCase()}/profile`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Profile' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><UserRound className="size-4" /> Profile</Link>
        {(role === 'DOCTOR' || role === 'PATIENT') && <Link href={`/${role.toLowerCase()}/visits`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Visits' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><CalendarDays className="size-4" /> Visits</Link>}
        {(role === 'DOCTOR' || role === 'PATIENT' || role === 'PHARMACY') && <Link href={`/${role.toLowerCase()}/prescriptions`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${page === 'Prescriptions' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}><ClipboardList className="size-4" /> Prescriptions</Link>}
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
        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} aria-controls="workspace-navigation"><Menu className="size-5" /></Button>
        <div className="hidden lg:block"><p className="text-xs text-slate-500">Workspace / {page}</p><p className="text-sm font-semibold">{names[role]} workspace</p></div>
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger render={<Button type="button" variant="ghost" className="h-11 gap-3 rounded-xl border border-slate-200 bg-white px-2.5 hover:bg-slate-50 sm:px-3" aria-label="Open account menu" />}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">{email.charAt(0).toUpperCase()}</span>
            <span className="hidden text-left sm:block"><span className="block text-sm font-semibold leading-tight text-slate-900">{names[role]} account</span><span className="block text-xs leading-tight text-slate-500">Account settings</span></span>
            <ChevronDown className="hidden size-4 text-slate-500 sm:block" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="border-b border-slate-100 px-3 py-3"><p className="text-sm font-semibold text-slate-900">{names[role]} account</p><p className="mt-1 break-all text-xs text-slate-500">{email}</p></div>
            <Link href={`/${role.toLowerCase()}/profile`} onClick={() => setAccountOpen(false)} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><UserRound className="size-4" /> Profile and password</Link>
            <button type="button" onClick={() => { setAccountOpen(false); onLogout(); }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"><LogOut className="size-4" /> Sign out</button>
          </PopoverContent>
        </Popover>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  </div>;
}
