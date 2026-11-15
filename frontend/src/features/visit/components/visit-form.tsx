'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormField } from '@/components/molecules/form-field';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createVisit, findPatient, visitKeys } from '../api';
import type { PatientSearch } from '../types';

export function VisitForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [patient, setPatient] = useState<PatientSearch | null>(null);
  const [lookupError, setLookupError] = useState('');
  const lookup = useMutation({ mutationFn: findPatient, onSuccess: (result) => { setPatient(result); setLookupError(result ? '' : 'No verified patient found with that email.'); } });
  const save = useMutation({ mutationFn: createVisit, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: visitKeys.all }); onSaved(); } });
  return <Card className="border-emerald-200 bg-white"><CardHeader><CardTitle>New visit</CardTitle><CardDescription>Find the patient by their exact email, then schedule a visit or start one now.</CardDescription></CardHeader><CardContent className="space-y-5">
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-64 flex-1"><FormField label="Patient email" name="patientEmail" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setPatient(null); setLookupError(''); }} placeholder="patient@example.com" /></div><Button type="button" variant="outline" disabled={!email || lookup.isPending} onClick={() => lookup.mutate(email)}>Find patient</Button></div>
    {lookup.isError && <Feedback message={lookup.error.message} />}{lookupError && <Feedback message={lookupError} />}
    {patient && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Patient: <strong>{patient.fullName || patient.email}</strong> · {patient.email}</p>}
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!patient) { setLookupError('Find a patient first.'); return; } const values = new FormData(event.currentTarget); const scheduledAt = String(values.get('scheduledAt') || ''); save.mutate({ patientId: patient.id, ...(scheduledAt && { scheduledAt: new Date(scheduledAt).toISOString() }), notes: String(values.get('notes') || '').trim() }); }}>
      <div className="grid gap-5 sm:grid-cols-2"><FormField label="Schedule (optional)" name="scheduledAt" type="datetime-local" hint="Leave blank to start the visit now." /><div className="space-y-2"><Label htmlFor="visit-notes">Doctor notes (private)</Label><Input id="visit-notes" name="notes" maxLength={4000} placeholder="Optional visit notes" className="h-11" /></div></div>
      {save.isError && <Feedback message={save.error.message} />}
      <div className="flex gap-3"><Button type="submit" disabled={!patient || save.isPending} className="bg-emerald-700 hover:bg-emerald-800">{save.isPending ? 'Saving…' : 'Create visit'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
    </form>
  </CardContent></Card>;
}
