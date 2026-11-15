'use client';

import { useQuery } from '@tanstack/react-query';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { listVisits, visitKeys } from '../api';
import { VisitList } from './visit-list';

export function PatientVisitsPage() { return <WorkspacePage role="PATIENT" page="Visits">{(user) => <PatientVisitsContent userId={user.id} />}</WorkspacePage>; }
function PatientVisitsContent({ userId }: { userId: string }) {
  const visits = useQuery({ queryKey: visitKeys.list(userId), queryFn: listVisits });
  return <div className="space-y-7"><SectionHeading eyebrow="Patient workspace" title="Your visits" description="See your scheduled, in-progress, and past doctor visits." />{visits.isPending ? <p className="text-sm text-slate-500">Loading visits…</p> : visits.isError ? <Feedback message={visits.error.message} /> : <VisitList visits={visits.data} role="PATIENT" />}</div>;
}
