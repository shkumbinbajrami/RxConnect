'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { FormField } from '@/components/molecules/form-field';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { Medicine } from '@/features/medicine/types';
import { addStock, stockKeys } from '../api';

export function AddStockForm({ pharmacyId, medicines, onSaved, onCancel }: {
  pharmacyId: string;
  medicines: Medicine[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [medicineId, setMedicineId] = useState('');
  const queryClient = useQueryClient();
  const add = useMutation({
    mutationFn: addStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockKeys.list(pharmacyId) });
      onSaved();
    },
  });

  return <Card className="border border-emerald-200 bg-white shadow-sm ring-0"><CardHeader><CardTitle className="text-lg">Add medicine to stock</CardTitle><CardDescription>Select an active catalog medicine and enter how many units you have.</CardDescription></CardHeader><CardContent>
    {medicines.length === 0 ? <div className="space-y-4"><p className="text-sm text-slate-600">No available medicines to add. An admin needs to add an active medicine to the catalog first.</p><Button type="button" variant="outline" onClick={onCancel}>Close</Button></div> : <form className="space-y-5" onSubmit={(event) => {
      event.preventDefault();
      if (!medicineId) return;
      const values = new FormData(event.currentTarget);
      add.mutate({ medicineId, quantity: Number(values.get('quantity')) });
    }}>
      <div className="space-y-2"><Label htmlFor="stock-medicine">Medicine</Label><Select value={medicineId} onValueChange={(value) => setMedicineId(value ?? '')}><SelectTrigger id="stock-medicine" className="h-11 w-full bg-white"><span className={`flex-1 truncate text-left ${!medicineId ? 'text-slate-500' : ''}`}>{medicines.find((medicine) => medicine.id === medicineId)?.name ?? 'Choose a medicine'}</span></SelectTrigger><SelectContent>{medicines.map((medicine) => <SelectItem key={medicine.id} value={medicine.id}>{medicine.name}{medicine.strength ? ` · ${medicine.strength}` : ''} — {medicine.unit}</SelectItem>)}</SelectContent></Select></div>
      <div className="max-w-48"><FormField label="Quantity" name="quantity" type="number" min="0" step="1" defaultValue="0" required hint="Count in the medicine’s stock unit." /></div>
      {add.isError && <Feedback message={add.error.message} />}
      <div className="flex flex-wrap gap-3"><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={!medicineId || add.isPending}>{add.isPending && <LoaderCircle className="size-4 animate-spin" />} Add to stock</Button><Button type="button" variant="outline" onClick={onCancel} disabled={add.isPending}>Cancel</Button></div>
    </form>}
  </CardContent></Card>;
}
