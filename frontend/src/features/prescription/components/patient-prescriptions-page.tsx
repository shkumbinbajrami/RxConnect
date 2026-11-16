'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { PageControls } from '@/components/molecules/page-controls';
import { TableFilters } from '@/components/molecules/table-filters';
import { DateText } from '@/components/atoms/date-text';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/ui/button';
import { PatientPrescriptionDrawer } from './patient-prescription-drawer';
import { prescriptionKeys, searchPrescriptions } from '../api';
import type { Prescription } from '../types';

export function PatientPrescriptionsPage() { return <WorkspacePage role="PATIENT" page="Prescriptions">{(user) => <PatientPrescriptionContent userId={user.id} />}</WorkspacePage>; }
function PatientPrescriptionContent({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Prescription['status'] | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const prescriptions = useQuery({ queryKey: [...prescriptionKeys.list(userId), page, limit, deferredSearch, status], queryFn: () => searchPrescriptions({ page, limit, search: deferredSearch, status }), placeholderData: keepPreviousData });
  const selected = prescriptions.data?.items.find((prescription) => prescription.id === selectedId);
  const changePage = (next: number) => { setSelectedId(null); setPage(next); };
  const changeLimit = (next: number) => { setSelectedId(null); setLimit(next); setPage(1); };
  return <div className="space-y-7"><SectionHeading eyebrow="Patient workspace" title="Your prescriptions" description="See your medicines, remaining quantities, pharmacy availability, and the code to share when collecting them." />
    <section className="space-y-4"><TableFilters loading={prescriptions.isFetching} search={search} onSearchChange={(value) => { setSelectedId(null); setSearch(value); setPage(1); }} searchLabel="Search prescriptions" searchPlaceholder="Search doctor or medicine" filterId="patient-prescription-status" filterLabel="Filter prescription status" filterValue={status} filterOptions={[{ value: '', label: 'All statuses' }, ...(['DRAFT', 'ISSUED', 'CANCELLED', 'EXPIRED'] as const).map((value) => ({ value, label: value }))]} onFilterChange={(value) => { setSelectedId(null); setStatus(value as Prescription['status'] | ''); setPage(1); }} />
      {prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : <>{prescriptions.data.items.length === 0 ? <EmptyState title={search || status ? 'No matching prescriptions' : 'No prescriptions yet'} description={search || status ? 'Try a different search or status.' : 'Your doctor’s prescriptions will appear here.'} /> : <DataTable headers={['Doctor', 'Medicines', 'Issued', 'Expires', 'Status', 'Actions']}>{prescriptions.data.items.map((prescription) => <tr key={prescription.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{prescription.doctor.fullName || 'Doctor'}</td><td className="px-4 py-4">{prescription.items.length} medicine{prescription.items.length === 1 ? '' : 's'}</td><td className="px-4 py-4"><DateText value={prescription.issuedAt || prescription.createdAt} /></td><td className="px-4 py-4"><DateText value={prescription.expiresAt} /></td><td className="px-4 py-4"><StatusBadge status={prescription.status} /></td><td className="px-4 py-4"><TableActions><Button size="sm" variant="outline" onClick={() => setSelectedId(prescription.id)}>View</Button></TableActions></td></tr>)}</DataTable>}<PageControls page={prescriptions.data.page} totalPages={prescriptions.data.totalPages} total={prescriptions.data.total} limit={limit} onPageChange={changePage} onLimitChange={changeLimit} /><PatientPrescriptionDrawer prescription={selected ?? null} onClose={() => setSelectedId(null)} /></>}
    </section>
  </div>;
}
