'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormField } from '@/components/molecules/form-field';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { updateStock, stockKeys } from '../api';

export function StockQuantityForm({ pharmacyId, medicineId, quantity, unit, onSaved, onCancel }: {
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  unit: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (nextQuantity: number) => updateStock(medicineId, nextQuantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockKeys.list(pharmacyId) });
      onSaved();
    },
  });

  return <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4" onSubmit={(event) => {
    event.preventDefault();
    save.mutate(Number(new FormData(event.currentTarget).get('quantity')));
  }}><div className="w-40"><FormField label={`Quantity (${unit})`} name="quantity" type="number" min="0" step="1" defaultValue={quantity} required /></div><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save quantity'}</Button><Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>Cancel</Button>{save.isError && <div className="w-full"><Feedback message={save.error.message} /></div>}</form>;
}
