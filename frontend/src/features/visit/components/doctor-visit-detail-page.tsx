'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ClipboardList, LockKeyhole, Plus } from 'lucide-react';
import { DateText } from '@/components/atoms/date-text';
import { DateTimePicker } from '@/components/molecules/date-time-picker';
import { Feedback } from '@/components/molecules/feedback';
import { ConfirmAction } from '@/components/molecules/confirm-action';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/ui/button';
import { DoctorPrescriptionTable } from '@/features/prescription/components/doctor-prescription-table';
import { PrescriptionForm } from '@/features/prescription/components/prescription-form';
import { listVisitPrescriptions, prescriptionKeys } from '@/features/prescription/api';
import { deleteVisit, getVisit, updateVisit, visitAction, visitKeys } from '../api';
import type { Visit } from '../types';

function VisitNotes({ visit }: { visit: Visit }) {
  const client = useQueryClient();
  const editable = visit.status === 'PLANNED' || visit.status === 'IN_PROGRESS';
  const save = useMutation({ mutationFn: (notes: string) => updateVisit(visit.id, { notes }), onSuccess: () => { void client.invalidateQueries({ queryKey: visitKeys.all }); } });
  return <form key={visit.updatedAt} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={(event) => { event.preventDefault(); save.mutate(String(new FormData(event.currentTarget).get('notes') || '').trim()); }}>
    <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ClipboardList className="size-5" /></span><div><h2 className="text-lg font-semibold text-slate-900">Consultation notes</h2><p className="mt-1 text-sm text-slate-500">Record the conversation, findings, and follow-up.</p></div></div>
    <div className="space-y-2"><label htmlFor="visit-notes" className="text-sm font-medium text-slate-800">Doctor notes</label><textarea id="visit-notes" name="notes" defaultValue={visit.notes || ''} maxLength={4000} rows={6} disabled={!editable} className="block min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50" placeholder="Symptoms, discussion, examination, assessment, and next steps…" /><p className="flex items-center gap-1 text-xs text-slate-500"><LockKeyhole className="size-3" /> Private to the doctor</p></div>
    {save.isError && <Feedback message={save.error.message} />}{save.isSuccess && <p className="text-sm text-emerald-700">Notes saved.</p>}
    {editable && <div className="flex justify-end"><Button type="submit" disabled={save.isPending} className="bg-emerald-700 hover:bg-emerald-800">{save.isPending ? 'Saving…' : 'Save notes'}</Button></div>}
  </form>;
}

function VisitSchedule({ visit }: { visit: Visit }) {
  const client = useQueryClient();
  const save = useMutation({ mutationFn: (scheduledAt: string | null) => updateVisit(visit.id, { scheduledAt }), onSuccess: () => { void client.invalidateQueries({ queryKey: visitKeys.all }); } });
  return <form key={visit.updatedAt} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get('scheduledAt') || ''); save.mutate(value ? new Date(value).toISOString() : null); }}><div className="flex items-center gap-2"><CalendarDays className="size-4 text-emerald-700" /><h2 className="font-semibold text-slate-900">Appointment</h2></div><DateTimePicker name="scheduledAt" label="Scheduled for" initialValue={visit.scheduledAt} />{save.isError && <Feedback message={save.error.message} />}{save.isSuccess && <p className="text-sm text-emerald-700">Schedule saved.</p>}<Button type="submit" variant="outline" disabled={save.isPending} className="w-full">{save.isPending ? 'Saving…' : 'Save schedule'}</Button></form>;
}

function DoctorVisitDetailContent({ userId, visitId }: { userId: string; visitId: string }) {
  const router = useRouter();
  const client = useQueryClient();
  const visit = useQuery({ queryKey: ['visits', visitId], queryFn: () => getVisit(visitId) });
  const prescriptions = useQuery({ queryKey: [...prescriptionKeys.list(userId), visitId], queryFn: () => listVisitPrescriptions(visitId) });
  const [addingPrescription, setAddingPrescription] = useState(false);
  const [confirming, setConfirming] = useState<'cancel' | 'delete' | 'discontinue' | null>(null);
  const transition = useMutation({ mutationFn: (action: 'start' | 'complete' | 'cancel' | 'discontinue') => visitAction(visitId, action), onSuccess: () => { setConfirming(null); void client.invalidateQueries({ queryKey: visitKeys.all }); } });
  const remove = useMutation({ mutationFn: () => deleteVisit(visitId), onSuccess: () => { setConfirming(null); void client.invalidateQueries({ queryKey: visitKeys.all }); router.push('/doctor/visits'); } });
  if (visit.isPending) return <p className="text-sm text-slate-500">Loading visit…</p>;
  if (visit.isError) return <Feedback message={visit.error.message} />;
  const current = visit.data;
  const related = prescriptions.data ?? [];
  const active = current.status === 'IN_PROGRESS';
  return <div className="mx-auto max-w-6xl space-y-6">
    <Button render={<Link href="/doctor/visits" />} variant="ghost" className="text-slate-600"><ArrowLeft className="size-4" /> All visits</Button>
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Patient visit</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{current.patientName || 'Patient'}</h1></div><StatusBadge status={current.status} /></div><dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduled</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.scheduledAt} /></dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Started</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.startedAt} /></dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ended</dt><dd className="mt-1 font-medium text-slate-800"><DateText value={current.endedAt} /></dd></div></dl></header>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><VisitNotes visit={current} /><aside className="space-y-5"><section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-semibold text-slate-900">Visit actions</h2><p className="mt-1 text-sm text-slate-500">{current.status === 'PLANNED' ? 'Start the visit when the patient arrives.' : active ? 'Finish the consultation when your notes and prescriptions are ready.' : 'This visit has ended.'}</p></div>{current.status === 'PLANNED' && <div className="space-y-2"><Button disabled={transition.isPending} onClick={() => transition.mutate('start')} className="w-full bg-emerald-700 hover:bg-emerald-800">Start visit</Button><Button variant="outline" disabled={transition.isPending} onClick={() => setConfirming('cancel')} className="w-full">Cancel visit</Button><Button variant="destructive" disabled={remove.isPending} onClick={() => setConfirming('delete')} className="w-full">Delete visit</Button></div>}{active && <div className="space-y-2"><Button disabled={transition.isPending} onClick={() => transition.mutate('complete')} className="w-full bg-emerald-700 hover:bg-emerald-800">Complete visit</Button><Button variant="outline" disabled={transition.isPending} onClick={() => setConfirming('discontinue')} className="w-full">Discontinue visit</Button></div>}{transition.isError && <Feedback message={transition.error.message} />}{remove.isError && <Feedback message={remove.error.message} />}</section>{current.status === 'PLANNED' && <VisitSchedule visit={current} />}</aside></div>
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Prescriptions</h2><p className="mt-1 text-sm text-slate-500">Medicines prescribed during this visit.</p></div>{active && <Button onClick={() => setAddingPrescription(true)} className="bg-emerald-700 hover:bg-emerald-800"><Plus className="size-4" /> Add prescription</Button>}</div>
      {addingPrescription && active && <PrescriptionForm visitId={visitId} onSaved={() => setAddingPrescription(false)} onCancel={() => setAddingPrescription(false)} />}
      {prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : related.length ? <DoctorPrescriptionTable prescriptions={related} /> : <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4"><ClipboardList className="mt-0.5 size-5 shrink-0 text-slate-400" /><div><p className="font-medium text-slate-800">No prescriptions yet</p><p className="mt-1 text-sm text-slate-500">{current.status === 'PLANNED' ? 'Start the visit to add a prescription.' : active ? 'Add a prescription if medicines are needed.' : 'No prescriptions were added to this visit.'}</p></div></div>}
    </section>
    <ConfirmAction open={confirming !== null} title={confirming === 'delete' ? 'Delete visit?' : confirming === 'cancel' ? 'Cancel visit?' : 'Discontinue visit?'} description={confirming === 'delete' ? 'This planned visit will be removed.' : confirming === 'cancel' ? 'This appointment will be marked cancelled.' : 'This consultation will end without being marked completed.'} actionLabel={confirming === 'delete' ? 'Delete visit' : confirming === 'cancel' ? 'Cancel visit' : 'Discontinue visit'} destructive={confirming === 'delete'} pending={remove.isPending || transition.isPending} onConfirm={() => { if (confirming === 'delete') remove.mutate(); else if (confirming) transition.mutate(confirming); }} onClose={() => setConfirming(null)} />
  </div>;
}

export function DoctorVisitDetailPage({ visitId }: { visitId: string }) { return <WorkspacePage role="DOCTOR" page="Visits">{(user) => <DoctorVisitDetailContent userId={user.id} visitId={visitId} />}</WorkspacePage>; }
