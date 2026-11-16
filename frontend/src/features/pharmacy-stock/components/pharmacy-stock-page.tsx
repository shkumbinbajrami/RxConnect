'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackagePlus } from 'lucide-react';
import { PriceText } from '@/components/atoms/price-text';
import { DeleteConfirm } from '@/components/molecules/delete-confirm';
import { EmptyState } from '@/components/molecules/empty-state';
import { Feedback } from '@/components/molecules/feedback';
import { PageControls } from '@/components/molecules/page-controls';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableFilters } from '@/components/molecules/table-filters';
import { SectionHeading } from '@/components/molecules/section-heading';
import { listMedicines, medicineKeys } from '@/features/medicine/api';
import type { CurrentUser } from '@/features/auth/types';
import { deleteStock, listStock, searchStock, stockKeys } from '../api';
import type { PharmacyStock } from '../types';
import { AddStockForm } from './add-stock-form';
import { StockQuantityForm } from './stock-quantity-form';

function StockContent({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const stock = useQuery({ queryKey: stockKeys.list(user.id), queryFn: listStock });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [inStock, setInStock] = useState<'all' | 'true' | 'false'>('all');
  const catalog = useQuery({ queryKey: medicineKeys.list('pharmacy'), queryFn: listMedicines });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PharmacyStock | null>(null);
  const [deleting, setDeleting] = useState<PharmacyStock | null>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const stockPage = useQuery({ queryKey: [...stockKeys.list(user.id), 'page', page, limit, deferredSearch, inStock], queryFn: () => searchStock({ page, limit, search: deferredSearch, ...(inStock !== 'all' && { inStock: inStock === 'true' }) }), placeholderData: keepPreviousData });
  const remove = useMutation({ mutationFn: deleteStock, onSuccess: () => { setDeleting(null); void queryClient.invalidateQueries({ queryKey: stockKeys.list(user.id) }); } });
  const rows = useMemo(() => stock.data ?? [], [stock.data]);
  const available = useMemo(() => (catalog.data ?? []).filter((medicine) => !rows.some((row) => row.medicineId === medicine.id)), [catalog.data, rows]);
  const filtered = stockPage.data?.items ?? [];

  return <div className="space-y-7">
    <SectionHeading eyebrow="Pharmacy workspace" title="Your stock" description="Track medicines and quantities available at your pharmacy." action={<Button type="button" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setAdding(true)}><PackagePlus className="size-4" /> Add to stock</Button>} />
    <div className="grid gap-4 sm:grid-cols-2"><Card className="border-slate-200 bg-white"><CardHeader><CardDescription>Medicines in stock</CardDescription><CardTitle className="text-3xl">{rows.length}</CardTitle></CardHeader></Card><Card className="border-slate-200 bg-white"><CardHeader><CardDescription>Catalog medicines ready to add</CardDescription><CardTitle className="text-3xl">{catalog.isPending ? '—' : available.length}</CardTitle></CardHeader></Card></div>
    {adding && (catalog.isPending || stock.isPending ? <p className="text-sm text-slate-500">Loading medicines…</p> : catalog.error ? <Feedback message={catalog.error.message} /> : <AddStockForm pharmacyId={user.id} medicines={available} onSaved={() => setAdding(false)} onCancel={() => setAdding(false)} />)}
    {editing && <StockQuantityForm pharmacyId={user.id} medicineId={editing.medicineId} quantity={editing.quantity} unit={editing.medicine.unit} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />}
    <Card className="border-slate-200 bg-white"><CardHeader><div className="flex flex-wrap items-center justify-between gap-4"><div><CardTitle className="text-lg">Stock list</CardTitle><CardDescription>{rows.length} medicine{rows.length === 1 ? '' : 's'} recorded</CardDescription></div></div></CardHeader><CardContent className="space-y-5">
      <TableFilters loading={stockPage.isFetching} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchLabel="Search stock" searchPlaceholder="Search your stock" filterId="stock-availability" filterLabel="Filter stock availability" filterValue={inStock === 'all' ? '' : inStock} filterOptions={[{ value: '', label: 'All stock' }, { value: 'true', label: 'Available' }, { value: 'false', label: 'Out of stock' }]} onFilterChange={(value) => { setInStock(value === '' ? 'all' : value as 'true' | 'false'); setPage(1); }} />
      {stockPage.error && <Feedback message={stockPage.error.message} />}{remove.isError && <Feedback message={remove.error.message} />}
      {stockPage.isPending ? <p className="py-10 text-center text-sm text-slate-500">Loading stock…</p> : stockPage.error ? null : filtered.length === 0 ? <EmptyState title={search ? 'No matching stock' : 'Your stock is empty'} description={search ? 'Try another search term.' : 'Add a medicine from the catalog.'} /> : <DataTable headers={['Medicine', 'Strength', 'Form', 'Quantity', 'Unit price', 'Status', 'Actions']}>
        {filtered.map((row) => <tr key={row.medicineId} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{row.medicine.name}</td><td className="px-4 py-4">{row.medicine.strength || '—'}</td><td className="px-4 py-4">{row.medicine.form || '—'}</td><td className="px-4 py-4">{row.quantity} {row.medicine.unit}</td><td className="px-4 py-4"><PriceText price={row.medicine.price} currency={row.medicine.currency} /></td><td className="px-4 py-4"><StatusBadge status={row.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'} /></td><td className="px-4 py-4"><TableActions><Button size="sm" variant="outline" onClick={() => setEditing(row)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => { remove.reset(); setDeleting(row); }}>Delete</Button></TableActions></td></tr>)}
      </DataTable>}
      {stockPage.data && <PageControls page={stockPage.data.page} totalPages={stockPage.data.totalPages} total={stockPage.data.total} limit={limit} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} />}
      {deleting && <DeleteConfirm label={deleting.medicine.name} pending={remove.isPending} onConfirm={() => remove.mutate(deleting.medicineId)} onCancel={() => setDeleting(null)} />}
    </CardContent></Card>
  </div>;
}

export function PharmacyStockPage() { return <WorkspacePage role="PHARMACY" page="Stock">{(user) => <StockContent user={user} />}</WorkspacePage>; }
