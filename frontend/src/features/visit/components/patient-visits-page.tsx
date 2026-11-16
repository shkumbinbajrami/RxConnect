'use client';

import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PageControls } from '@/components/molecules/page-controls';
import { TableFilters } from '@/components/molecules/table-filters';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { searchVisits, visitKeys } from '../api';
import type { VisitStatus } from '../types';
import { VisitList } from './visit-list';

export function PatientVisitsPage() { return <WorkspacePage role="PATIENT" page="Visits">{(user) => <PatientVisitsContent userId={user.id} />}</WorkspacePage>; }
function PatientVisitsContent({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const deferredSearch = useDeferredValue(search);
  const visits = useQuery({ queryKey: [...visitKeys.list(userId), page, limit, deferredSearch, status], queryFn: () => searchVisits({ page, limit, search: deferredSearch, status }), placeholderData: keepPreviousData });
  return <div className="space-y-7"><SectionHeading eyebrow="Patient workspace" title="Your visits" description="See your scheduled, in-progress, and past doctor visits." /><section className="space-y-4"><TableFilters loading={visits.isFetching} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchLabel="Search visits" searchPlaceholder="Search doctor" filterId="patient-visit-status" filterLabel="Filter visit status" filterValue={status} filterOptions={[{ value: '', label: 'All statuses' }, ...(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISCONTINUED'] as const).map((value) => ({ value, label: value.replaceAll('_', ' ') }))]} onFilterChange={(value) => { setStatus(value as VisitStatus | ''); setPage(1); }} />{visits.isPending ? <p className="text-sm text-slate-500">Loading visits…</p> : visits.isError ? <Feedback message={visits.error.message} /> : <><VisitList visits={visits.data.items} role="PATIENT" filtered={Boolean(search || status)} /><PageControls page={visits.data.page} totalPages={visits.data.totalPages} total={visits.data.total} limit={limit} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} /></>}</section></div>;
}
