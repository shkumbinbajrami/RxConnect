'use client';

import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/molecules/empty-state';
import { DeleteConfirm } from '@/components/molecules/delete-confirm';
import { Feedback } from '@/components/molecules/feedback';
import { PageControls } from '@/components/molecules/page-controls';
import { PriceText } from '@/components/atoms/price-text';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableFilters } from '@/components/molecules/table-filters';
import { SectionHeading } from '@/components/molecules/section-heading';
import { deleteMedicine, medicineKeys, searchMedicines } from '../api';
import type { Medicine } from '../types';
import { MedicineForm } from './medicine-form';

function CatalogContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
  const deferredSearch = useDeferredValue(search);
  const { data, error, isPending } = useQuery({ queryKey: [...medicineKeys.list('admin'), page, limit, deferredSearch, active], queryFn: () => searchMedicines({ page, limit, search: deferredSearch, ...(active !== 'all' && { isActive: active === 'true' }) }), placeholderData: keepPreviousData });
  const medicines = data?.items ?? [];
  const [editing, setEditing] = useState<Medicine | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Medicine | null>(null);
  const remove = useMutation({ mutationFn: deleteMedicine, onSuccess: () => { setDeleting(null); void queryClient.invalidateQueries({ queryKey: medicineKeys.all }); } });

  return <div className="space-y-7">
    <SectionHeading eyebrow="Admin workspace" title="Medicines" description="Manage shared medicines and prices." action={<Button type="button" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditing('new')}><Plus className="size-4" /> Add medicine</Button>} />
    {editing && <MedicineForm key={editing === 'new' ? 'new' : editing.id} medicine={editing === 'new' ? null : editing} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />}
    <Card className="border-slate-200 bg-white"><CardHeader><div className="flex flex-wrap items-center justify-between gap-4"><div><CardTitle className="text-lg">Catalog</CardTitle><CardDescription>{data?.total ?? 0} medicine{data?.total === 1 ? '' : 's'} recorded</CardDescription></div></div></CardHeader><CardContent className="space-y-5">
      <TableFilters loading={isPending} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchLabel="Search medicines" searchPlaceholder="Search medicines" filterId="medicine-status" filterLabel="Filter medicine status" filterValue={active === 'all' ? '' : active} filterOptions={[{ value: '', label: 'All statuses' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} onFilterChange={(value) => { setActive(value === '' ? 'all' : value as 'true' | 'false'); setPage(1); }} />
      {error && <Feedback message={error.message} />}{remove.isError && <Feedback message={remove.error.message} />}
      {isPending ? <p className="py-10 text-center text-sm text-slate-500">Loading medicines…</p> : error ? null : medicines.length === 0 ? <EmptyState title={search ? 'No matching medicines' : 'No medicines yet'} description={search ? 'Try a different search term.' : 'Add the first medicine to the catalog.'} /> : <DataTable headers={['Medicine', 'Strength', 'Form', 'Stock unit', 'Price', 'Status', 'Actions']}>
        {medicines.map((medicine) => <tr key={medicine.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{medicine.name}</td><td className="px-4 py-4">{medicine.strength || '—'}</td><td className="px-4 py-4">{medicine.form || '—'}</td><td className="px-4 py-4">{medicine.unit}</td><td className="px-4 py-4"><PriceText price={medicine.price} currency={medicine.currency} /></td><td className="px-4 py-4"><StatusBadge status={medicine.isActive ? 'ACTIVE' : 'INACTIVE'} /></td><td className="px-4 py-4"><TableActions><Button type="button" size="sm" variant="outline" onClick={() => setEditing(medicine)}>Edit</Button><Button type="button" size="sm" variant="destructive" onClick={() => { remove.reset(); setDeleting(medicine); }}>Delete</Button></TableActions></td></tr>)}
      </DataTable>}
      {data && <PageControls page={data.page} totalPages={data.totalPages} total={data.total} limit={limit} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} />}
      {deleting && <DeleteConfirm label={deleting.name} pending={remove.isPending} onConfirm={() => remove.mutate(deleting.id)} onCancel={() => setDeleting(null)} />}
    </CardContent></Card>
  </div>;
}

export function MedicineCatalog() { return <WorkspacePage role="ADMIN" page="Medicines">{() => <CatalogContent />}</WorkspacePage>; }
