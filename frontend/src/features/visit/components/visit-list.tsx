'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateText } from '@/components/atoms/date-text';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { visitAction, visitKeys } from '../api';
import type { Visit } from '../types';

export function VisitList({ visits, role, onPrescribe }: { visits: Visit[]; role: 'DOCTOR' | 'PATIENT'; onPrescribe?: (visit: Visit) => void }) {
  const queryClient = useQueryClient();
  const action = useMutation({ mutationFn: ({ id, next }: { id: string; next: 'start' | 'complete' | 'cancel' | 'discontinue' }) => visitAction(id, next), onSuccess: () => void queryClient.invalidateQueries({ queryKey: visitKeys.all }) });
  if (visits.length === 0) return <EmptyState title="No visits yet" description={role === 'DOCTOR' ? 'Create a visit to begin caring for a patient.' : 'Your doctor visits will appear here.'} />;
  return <div className="space-y-4">{action.isError && <Feedback message={action.error.message} />}{visits.map((visit) => <Card key={visit.id} className="border-slate-200 bg-white"><CardContent className="space-y-4 py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{role === 'DOCTOR' ? visit.patientName || 'Patient' : visit.doctorName || 'Doctor'}</p><p className="mt-1 text-sm text-slate-500">{visit.scheduledAt ? <DateText value={visit.scheduledAt} /> : visit.startedAt ? <DateText value={visit.startedAt} /> : <DateText value={visit.createdAt} />}</p></div><Badge variant="secondary">{visit.status.replaceAll('_', ' ')}</Badge></div>{role === 'DOCTOR' && visit.notes && <p className="text-sm text-slate-600">{visit.notes}</p>}{role === 'DOCTOR' && <div className="flex flex-wrap gap-2">{visit.status === 'PLANNED' && <><Button size="sm" disabled={action.isPending} onClick={() => action.mutate({ id: visit.id, next: 'start' })}>Start</Button><Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: visit.id, next: 'cancel' })}>Cancel</Button></>}{visit.status === 'IN_PROGRESS' && <><Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => onPrescribe?.(visit)}>Write prescription</Button><Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: visit.id, next: 'complete' })}>Complete</Button><Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: visit.id, next: 'discontinue' })}>Discontinue</Button></>}</div>}</CardContent></Card>)}</div>;
}
