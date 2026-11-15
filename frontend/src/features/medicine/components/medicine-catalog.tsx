'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import { EmptyState } from '@/components/molecules/empty-state';
import { DeleteConfirm } from '@/components/molecules/delete-confirm';
import { Feedback } from '@/components/molecules/feedback';
import { PriceText } from '@/components/atoms/price-text';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { deleteMedicine, listMedicines, medicineKeys } from '../api';
import type { Medicine } from '../types';
import { MedicineForm } from './medicine-form';
import { MedicineIdentity } from './medicine-identity';

function CatalogContent() {
  const queryClient = useQueryClient();
  const { data: medicines = [], error, isPending, isFetching, refetch } = useQuery({ queryKey: medicineKeys.list('admin'), queryFn: listMedicines });
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Medicine | 'new' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const remove = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => {
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: medicineKeys.all });
    },
  });
  const filtered = useMemo(() => medicines.filter((medicine) => [medicine.name, medicine.strength, medicine.form].some((part) => part?.toLowerCase().includes(search.toLowerCase()))), [medicines, search]);

  return <div className="space-y-7">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Admin catalog</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Medicines</h1><p className="mt-3 max-w-2xl text-slate-600">Manage the medicines and shared prices available to pharmacies.</p></div><Button type="button" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditing('new')}><Plus className="size-4" /> Add medicine</Button></div>
    {editing && <MedicineForm key={editing === 'new' ? 'new' : editing.id} medicine={editing === 'new' ? null : editing} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />}
    <Card className="border border-slate-200 bg-white shadow-sm ring-0"><CardHeader><div className="flex flex-wrap items-center justify-between gap-4"><div><CardTitle className="text-lg">Catalog</CardTitle><CardDescription>{medicines.length} medicine{medicines.length === 1 ? '' : 's'}. Stocked medicines can be deactivated, but cannot be deleted.</CardDescription></div><Button type="button" variant="outline" onClick={() => void refetch()} disabled={isFetching}><RefreshCcw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh</Button></div></CardHeader><CardContent className="space-y-5">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Search medicines" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines" className="h-10 pl-10" /></div>
      {error && <Feedback message={error.message} />}
      {remove.isError && <Feedback message={remove.error.message} />}
      {isPending ? <p className="py-10 text-center text-sm text-slate-500">Loading medicines…</p> : error ? null : filtered.length === 0 ? <EmptyState title={search ? 'No matching medicines' : 'No medicines yet'} description={search ? 'Try a different search term.' : 'Add the first medicine to make it available in the pharmacy catalog.'} /> : <div className="divide-y divide-slate-100">{filtered.map((medicine) => <div key={medicine.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center justify-between gap-4"><MedicineIdentity medicine={medicine} /><div className="flex flex-wrap items-center gap-3"><Badge variant={medicine.isActive ? 'secondary' : 'outline'}>{medicine.isActive ? 'Active' : 'Inactive'}</Badge><span className="min-w-24 text-right text-sm"><PriceText price={medicine.price} currency={medicine.currency} /><span className="block text-xs text-slate-500">per {medicine.unit}</span></span><Button type="button" size="sm" variant="outline" onClick={() => setEditing(medicine)}>Edit</Button><Button type="button" size="sm" variant="destructive" onClick={() => { remove.reset(); setDeleting(medicine.id); }}>Remove</Button></div></div>{deleting === medicine.id && <div className="mt-3"><DeleteConfirm label={medicine.name} pending={remove.isPending} onConfirm={() => remove.mutate(medicine.id)} onCancel={() => setDeleting(null)} /></div>}</div>)}</div>}
    </CardContent></Card>
  </div>;
}

export function MedicineCatalog() {
  return <WorkspacePage role="ADMIN" page="Medicines">{() => <CatalogContent />}</WorkspacePage>;
}
