'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCcw } from 'lucide-react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/molecules/form-field';
import { PrescriptionCard } from '@/features/prescription/components/prescription-card';
import { PrescriptionForm } from '@/features/prescription/components/prescription-form';
import { cancelPrescription, deletePrescription, issuePrescription, listPrescriptions, prescriptionKeys } from '@/features/prescription/api';
import type { Prescription } from '@/features/prescription/types';
import type { Visit } from '../types';
import { listVisits, visitKeys } from '../api';
import { VisitForm } from './visit-form';
import { VisitList } from './visit-list';

function DoctorVisitsContent({ userId }: { userId: string }) {
  const client = useQueryClient();
  const visits = useQuery({ queryKey: visitKeys.list(userId), queryFn: listVisits });
  const prescriptions = useQuery({ queryKey: prescriptionKeys.list(userId), queryFn: listPrescriptions });
  const [addingVisit, setAddingVisit] = useState(false);
  const [prescribing, setPrescribing] = useState<Visit | null>(null);
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [issuing, setIssuing] = useState<string | null>(null);
  const action = useMutation({ mutationFn: async (input: { kind: 'issue' | 'cancel' | 'delete'; id: string; expiresAt?: string }) => input.kind === 'issue' ? issuePrescription(input.id, input.expiresAt!) : input.kind === 'cancel' ? cancelPrescription(input.id) : deletePrescription(input.id), onSuccess: () => { setIssuing(null); void client.invalidateQueries({ queryKey: prescriptionKeys.all }); } });
  return <div className="space-y-8"><SectionHeading eyebrow="Doctor workspace" title="Visits & prescriptions" description="Manage your patient visits and issue prescriptions from the shared medicine catalog." action={<Button onClick={() => setAddingVisit(true)} className="bg-emerald-700 hover:bg-emerald-800"><Plus className="size-4" /> New visit</Button>} />
    {addingVisit && <VisitForm onSaved={() => setAddingVisit(false)} onCancel={() => setAddingVisit(false)} />}
    <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Visits</h2><Button variant="outline" size="sm" onClick={() => void visits.refetch()} disabled={visits.isFetching}><RefreshCcw className="size-4" /> Refresh</Button></div>{visits.isPending ? <p className="text-sm text-slate-500">Loading visits…</p> : visits.isError ? <Feedback message={visits.error.message} /> : <VisitList visits={visits.data} role="DOCTOR" onPrescribe={(visit) => { setPrescribing(visit); setEditing(null); }} />}</section>
    {prescribing && <section id="prescription-form"><PrescriptionForm visitId={prescribing.id} onSaved={() => setPrescribing(null)} onCancel={() => setPrescribing(null)} /></section>}
    <section className="space-y-4"><h2 className="text-xl font-semibold">Prescriptions</h2>{prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : prescriptions.data.length === 0 ? <EmptyState title="No prescriptions yet" description="Open an in-progress visit to write a prescription." /> : prescriptions.data.map((prescription) => <div key={prescription.id} className="space-y-3"><PrescriptionCard prescription={prescription}><div className="flex flex-wrap gap-2">{prescription.status === 'DRAFT' && <><Button size="sm" variant="outline" onClick={() => { setEditing(prescription); setPrescribing(null); }}>Edit draft</Button><Button size="sm" onClick={() => setIssuing(prescription.id)}>Issue</Button><Button size="sm" variant="outline" disabled={action.isPending} onClick={() => { if (window.confirm('Delete this draft prescription?')) action.mutate({ kind: 'delete', id: prescription.id }); }}>Delete draft</Button></>}{prescription.status === 'ISSUED' && <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => { if (window.confirm('Cancel this prescription? The patient can no longer use its code.')) action.mutate({ kind: 'cancel', id: prescription.id }); }}>Cancel prescription</Button>}</div>{issuing === prescription.id && <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get('expiresAt')); action.mutate({ kind: 'issue', id: prescription.id, expiresAt: new Date(value).toISOString() }); }}><FormField label="Prescription expires" name="expiresAt" type="datetime-local" required /><Button type="submit" disabled={action.isPending}>Confirm issue</Button><Button type="button" variant="outline" onClick={() => setIssuing(null)}>Cancel</Button></form>}{action.isError && <Feedback message={action.error.message} />}</PrescriptionCard>{editing?.id === prescription.id && <PrescriptionForm visitId={prescription.visitId} draft={prescription} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />}</div>)}</section>
  </div>;
}

export function DoctorVisitsPage() { return <WorkspacePage role="DOCTOR" page="Visits">{(user) => <DoctorVisitsContent userId={user.id} />}</WorkspacePage>; }
