'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { DateText } from '@/components/atoms/date-text';
import { Feedback } from '@/components/molecules/feedback';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/ui/button';
import { PatientPrescriptionDrawer } from '@/features/prescription/components/patient-prescription-drawer';
import { listVisitPrescriptions, prescriptionKeys } from '@/features/prescription/api';
import { getVisit, visitKeys } from '../api';

function PatientVisitContent({ userId, visitId }: { userId: string; visitId: string }) {
  const visit = useQuery({ queryKey: [...visitKeys.list(userId), visitId], queryFn: () => getVisit(visitId) });
  const prescriptions = useQuery({ queryKey: [...prescriptionKeys.list(userId), visitId], queryFn: () => listVisitPrescriptions(visitId) });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (visit.isPending) return <p className="text-sm text-slate-500">Loading visit…</p>;
  if (visit.isError) return <Feedback message={visit.error.message} />;
  const current = visit.data;
  const selected = prescriptions.data?.find((item) => item.id === selectedId) ?? null;
  return <div className="mx-auto max-w-6xl space-y-6"><Button render={<Link href="/patient/visits" />} variant="ghost" className="text-slate-600"><ArrowLeft className="size-4" /> All visits</Button>
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your visit</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Visit with {current.doctorName || 'your doctor'}</h1></div><StatusBadge status={current.status} /></div><dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduled</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.scheduledAt} /></dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Started</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.startedAt} /></dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ended</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.endedAt} /></dd></div></dl></header>
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="text-lg font-semibold text-slate-900">Prescriptions from this visit</h2><p className="mt-1 text-sm text-slate-500">Open a prescription to see its medicines, code, and pharmacy options.</p></div>{prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : prescriptions.data.length === 0 ? <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4"><ClipboardList className="mt-0.5 size-5 shrink-0 text-slate-400" /><div><p className="font-medium text-slate-800">No prescriptions yet</p><p className="mt-1 text-sm text-slate-500">Prescriptions from this visit will appear here.</p></div></div> : <DataTable headers={['Medicines', 'Issued', 'Expires', 'Status', 'Actions']}>{prescriptions.data.map((prescription) => <tr key={prescription.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{prescription.items.length} medicine{prescription.items.length === 1 ? '' : 's'}</td><td className="px-4 py-4"><DateText value={prescription.issuedAt || prescription.createdAt} /></td><td className="px-4 py-4"><DateText value={prescription.expiresAt} /></td><td className="px-4 py-4"><StatusBadge status={prescription.status} /></td><td className="px-4 py-4"><TableActions><Button size="sm" variant="outline" onClick={() => setSelectedId(prescription.id)}>View</Button></TableActions></td></tr>)}</DataTable>}</section>
    <PatientPrescriptionDrawer prescription={selected} onClose={() => setSelectedId(null)} />
  </div>;
}

export function PatientVisitDetailPage({ visitId }: { visitId: string }) { return <WorkspacePage role="PATIENT" page="Visits">{(user) => <PatientVisitContent userId={user.id} visitId={visitId} />}</WorkspacePage>; }
