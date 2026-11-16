'use client';

import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { PageControls } from '@/components/molecules/page-controls';
import { Button } from '@/components/ui/button';
import { TableFilters } from '@/components/molecules/table-filters';
import { searchVisits, visitKeys } from '../api';
import type { VisitStatus } from '../types';
import { VisitForm } from './visit-form';
import { VisitList } from './visit-list';

function DoctorVisitsContent({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const deferredSearch = useDeferredValue(search);
  const visits = useQuery({ queryKey: [...visitKeys.list(userId), page, limit, deferredSearch, status], queryFn: () => searchVisits({ page, limit, search: deferredSearch, status }), placeholderData: keepPreviousData });
  const [addingVisit, setAddingVisit] = useState(false);
  return <div className="space-y-8"><SectionHeading eyebrow="Doctor workspace" title="Visits" description="Manage patient visits and care notes." action={<Button onClick={() => setAddingVisit(true)} className="bg-emerald-700 hover:bg-emerald-800"><Plus className="size-4" /> New visit</Button>} />
    {addingVisit && <VisitForm onSaved={() => setAddingVisit(false)} onCancel={() => setAddingVisit(false)} />}
    <section className="space-y-4"><TableFilters loading={visits.isFetching} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchLabel="Search visits" searchPlaceholder="Search patient or notes" filterId="visit-status" filterLabel="Filter visit status" filterValue={status} filterOptions={[{ value: '', label: 'All statuses' }, ...(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISCONTINUED'] as const).map((value) => ({ value, label: value.replaceAll('_', ' ') }))]} onFilterChange={(value) => { setStatus(value as VisitStatus | ''); setPage(1); }} />{visits.isPending ? <p className="text-sm text-slate-500">Loading visits…</p> : visits.isError ? <Feedback message={visits.error.message} /> : <><VisitList visits={visits.data.items} role="DOCTOR" filtered={Boolean(search || status)} /><PageControls page={visits.data.page} totalPages={visits.data.totalPages} total={visits.data.total} limit={limit} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} /></>}</section>
  </div>;
}

export function DoctorVisitsPage() { return <WorkspacePage role="DOCTOR" page="Visits">{(user) => <DoctorVisitsContent userId={user.id} />}</WorkspacePage>; }
