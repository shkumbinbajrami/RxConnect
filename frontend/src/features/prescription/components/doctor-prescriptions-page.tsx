'use client';

import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Feedback } from '@/components/molecules/feedback';
import { PageControls } from '@/components/molecules/page-controls';
import { SectionHeading } from '@/components/molecules/section-heading';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { TableFilters } from '@/components/molecules/table-filters';
import { prescriptionKeys, searchPrescriptions } from '../api';
import type { Prescription } from '../types';
import { DoctorPrescriptionTable } from './doctor-prescription-table';

function DoctorPrescriptionsContent({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Prescription['status'] | ''>('');
  const deferredSearch = useDeferredValue(search);
  const prescriptions = useQuery({ queryKey: [...prescriptionKeys.list(userId), page, limit, deferredSearch, status], queryFn: () => searchPrescriptions({ page, limit, search: deferredSearch, status }), placeholderData: keepPreviousData });
  return <div className="space-y-8">
    <SectionHeading eyebrow="Doctor workspace" title="Prescriptions" description="Find prescriptions across all your visits. Open a visit to add a new prescription or update its details." />
    <section className="space-y-4">
      <TableFilters loading={prescriptions.isFetching} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchLabel="Search prescriptions" searchPlaceholder="Search patient or medicine" filterId="prescription-status" filterLabel="Filter prescription status" filterValue={status} filterOptions={[{ value: '', label: 'All statuses' }, ...(['DRAFT', 'ISSUED', 'CANCELLED', 'EXPIRED'] as const).map((value) => ({ value, label: value }))]} onFilterChange={(value) => { setStatus(value as Prescription['status'] | ''); setPage(1); }} />
      {prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : <><DoctorPrescriptionTable prescriptions={prescriptions.data.items} showVisit /><PageControls page={prescriptions.data.page} totalPages={prescriptions.data.totalPages} total={prescriptions.data.total} limit={limit} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} /></>}
    </section>
  </div>;
}

export function DoctorPrescriptionsPage() { return <WorkspacePage role="DOCTOR" page="Prescriptions">{(user) => <DoctorPrescriptionsContent userId={user.id} />}</WorkspacePage>; }
