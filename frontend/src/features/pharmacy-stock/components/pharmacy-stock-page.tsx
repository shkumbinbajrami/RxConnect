'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackagePlus, RefreshCcw, Search } from 'lucide-react';
import { PriceText } from '@/components/atoms/price-text';
import { DeleteConfirm } from '@/components/molecules/delete-confirm';
import { EmptyState } from '@/components/molecules/empty-state';
import { Feedback } from '@/components/molecules/feedback';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listMedicines, medicineKeys } from '@/features/medicine/api';
import { MedicineIdentity } from '@/features/medicine/components/medicine-identity';
import type { CurrentUser } from '@/features/auth/types';
import { deleteStock, listStock, stockKeys } from '../api';
import { AddStockForm } from './add-stock-form';
import { StockQuantityForm } from './stock-quantity-form';

function StockContent({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const stock = useQuery({ queryKey: stockKeys.list(user.id), queryFn: listStock });
  const catalog = useQuery({ queryKey: medicineKeys.list('pharmacy'), queryFn: listMedicines });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const remove = useMutation({
    mutationFn: deleteStock,
    onSuccess: () => {
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: stockKeys.list(user.id) });
    },
  });
  const rows = useMemo(() => stock.data ?? [], [stock.data]);
  const available = useMemo(() => (catalog.data ?? []).filter((medicine) => !rows.some((row) => row.medicineId === medicine.id)), [catalog.data, rows]);
  const filtered = useMemo(() => rows.filter((row) => [row.medicine.name, row.medicine.strength, row.medicine.form].some((part) => part?.toLowerCase().includes(search.toLowerCase()))), [rows, search]);

  return <div className="space-y-7">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Pharmacy workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your stock</h1><p className="mt-3 max-w-2xl text-slate-600">Track the catalog medicines and quantities available at your pharmacy.</p></div><Button type="button" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setAdding(true)}><PackagePlus className="size-4" /> Add to stock</Button></div>
    <div className="grid gap-4 sm:grid-cols-2"><Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardDescription>Medicines in stock</CardDescription><CardTitle className="text-3xl font-semibold">{rows.length}</CardTitle></CardHeader></Card><Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><CardDescription>Catalog medicines ready to add</CardDescription><CardTitle className="text-3xl font-semibold">{catalog.isPending ? '—' : available.length}</CardTitle></CardHeader></Card></div>
    {adding && (catalog.isPending || stock.isPending ? <p className="text-sm text-slate-500">Loading medicines…</p> : catalog.error ? <Feedback message={catalog.error.message} /> : <AddStockForm pharmacyId={user.id} medicines={available} onSaved={() => setAdding(false)} onCancel={() => setAdding(false)} />)}
    <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><div className="flex flex-wrap items-center justify-between gap-4"><div><CardTitle className="text-lg">Stock list</CardTitle><CardDescription>{rows.length} medicine{rows.length === 1 ? '' : 's'} recorded</CardDescription></div><Button type="button" variant="outline" onClick={() => { void stock.refetch(); void catalog.refetch(); }} disabled={stock.isFetching || catalog.isFetching}><RefreshCcw className={`size-4 ${stock.isFetching || catalog.isFetching ? 'animate-spin' : ''}`} /> Refresh</Button></div></CardHeader><CardContent className="space-y-5">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Search stock" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your stock" className="h-10 pl-10" /></div>
      {stock.error && <Feedback message={stock.error.message} />}
      {remove.isError && <Feedback message={remove.error.message} />}
      {stock.isPending ? <p className="py-10 text-center text-sm text-slate-500">Loading stock…</p> : stock.error ? null : filtered.length === 0 ? <EmptyState title={search ? 'No matching stock' : 'Your stock is empty'} description={search ? 'Try another search term.' : 'Add a medicine from the catalog to start recording your stock.'} /> : <div className="divide-y divide-slate-100">{filtered.map((row) => <div key={row.medicineId} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center justify-between gap-4"><MedicineIdentity medicine={row.medicine} /><div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">{row.quantity} {row.medicine.unit}</Badge>{!row.medicine.isActive && <Badge variant="outline">Inactive</Badge>}<span className="min-w-24 text-right text-sm"><PriceText price={row.medicine.price} currency={row.medicine.currency} /><span className="block text-xs text-slate-500">per {row.medicine.unit}</span></span><Button type="button" size="sm" variant="outline" onClick={() => setEditing(row.medicineId)}>Edit</Button><Button type="button" size="sm" variant="destructive" onClick={() => { remove.reset(); setDeleting(row.medicineId); }}>Remove</Button></div></div>{editing === row.medicineId && <StockQuantityForm pharmacyId={user.id} medicineId={row.medicineId} quantity={row.quantity} unit={row.medicine.unit} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />}{deleting === row.medicineId && <div className="mt-3"><DeleteConfirm label={row.medicine.name} pending={remove.isPending} onConfirm={() => remove.mutate(row.medicineId)} onCancel={() => setDeleting(null)} /></div>}</div>)}</div>}
    </CardContent></Card>
  </div>;
}

export function PharmacyStockPage() {
  return <WorkspacePage role="PHARMACY" page="Stock">{(user) => <StockContent user={user} />}</WorkspacePage>;
}
