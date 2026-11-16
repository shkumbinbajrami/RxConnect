'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { listMedicines, medicineKeys } from '@/features/medicine/api';
import { createPrescription, prescriptionKeys, updatePrescription } from '../api';
import type { Prescription, PrescriptionInput } from '../types';

type Line = PrescriptionInput['items'][number];
const emptyLine = (): Line => ({ medicineId: '', quantity: 1, dosageInstructions: '' });

export function PrescriptionForm({ visitId, draft, onSaved, onCancel }: { visitId: string; draft?: Prescription; onSaved: () => void; onCancel: () => void }) {
  const client = useQueryClient();
  const catalog = useQuery({ queryKey: medicineKeys.list('pharmacy'), queryFn: listMedicines });
  const [items, setItems] = useState<Line[]>(draft ? draft.items.map((item) => ({ medicineId: item.medicineId, quantity: item.quantity, dosageInstructions: item.dosageInstructions })) : [emptyLine()]);
  const [validation, setValidation] = useState('');
  const save = useMutation({ mutationFn: () => draft ? updatePrescription(draft.id, items) : createPrescription({ visitId, items }), onSuccess: () => { void client.invalidateQueries({ queryKey: prescriptionKeys.all }); onSaved(); } });
  const medicines = (catalog.data ?? []).filter((medicine) => medicine.isActive);
  function setLine(index: number, patch: Partial<Line>) { setItems((current) => current.map((line, position) => position === index ? { ...line, ...patch } : line)); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.some((item) => !item.medicineId || !item.dosageInstructions.trim() || !Number.isInteger(item.quantity) || item.quantity < 1) || new Set(items.map((item) => item.medicineId)).size !== items.length) {
      setValidation('Choose a different medicine for each line, then enter a quantity and dosage instructions.');
      return;
    }
    setValidation('');
    save.mutate();
  }
  return <form className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={submit}>
    <div><h2 className="text-lg font-semibold text-slate-900">{draft ? 'Edit prescription draft' : 'Write prescription'}</h2><p className="mt-1 text-sm text-slate-500">Add each medicine with its quantity and instructions for the patient.</p></div>
    {catalog.isPending && <p className="text-sm text-slate-500">Loading medicines…</p>}{catalog.isError && <Feedback message={catalog.error.message} />}
    <div className="space-y-3">{items.map((item, index) => {
      const selected = medicines.find((medicine) => medicine.id === item.medicineId);
      const usedElsewhere = new Set(items.filter((_, position) => position !== index).map((line) => line.medicineId));
      return <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Medicine {index + 1}</p>{selected && <p className="mt-0.5 text-sm font-medium text-slate-900">{selected.name}{selected.strength ? ` ${selected.strength}` : ''}</p>}</div><Button type="button" size="sm" variant="ghost" aria-label={`Remove medicine ${index + 1}`} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, position) => position !== index))} className="text-slate-500 hover:text-red-700"><Trash2 className="size-4" /> Remove</Button></div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_130px]"><div className="space-y-2"><Label htmlFor={`medicine-${index}`}>Medicine</Label><Select value={item.medicineId || null} onValueChange={(value) => setLine(index, { medicineId: value ?? '' })}><SelectTrigger id={`medicine-${index}`} className="h-11 w-full border-slate-200 bg-white px-3"><span className={`min-w-0 flex-1 truncate text-left ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{selected ? `${selected.name}${selected.strength ? ` ${selected.strength}` : ''} · ${selected.unit}` : 'Choose medicine'}</span></SelectTrigger><SelectContent>{medicines.map((medicine) => <SelectItem key={medicine.id} value={medicine.id} disabled={usedElsewhere.has(medicine.id)}>{medicine.name}{medicine.strength ? ` ${medicine.strength}` : ''} · {medicine.unit}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor={`quantity-${index}`}>Quantity{selected ? ` (${selected.unit})` : ''}</Label><Input id={`quantity-${index}`} type="number" min={1} step={1} value={item.quantity} onChange={(event) => setLine(index, { quantity: Number(event.target.value) })} required className="h-11 border-slate-200 bg-white" /></div></div>
        <div className="space-y-2"><Label htmlFor={`instructions-${index}`}>Dosage instructions</Label><textarea id={`instructions-${index}`} value={item.dosageInstructions} maxLength={1000} onChange={(event) => setLine(index, { dosageInstructions: event.target.value })} placeholder="For example: take one tablet twice a day after meals" required rows={2} className="block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
      </div>;
    })}</div>
    <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, emptyLine()])} className="border-dashed border-emerald-300 text-emerald-800 hover:bg-emerald-50"><Plus className="size-4" /> Add another medicine</Button>
    {validation && <Feedback message={validation} />}{save.isError && <Feedback message={save.error.message} />}
    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={save.isPending || catalog.isPending} className="bg-emerald-700 hover:bg-emerald-800">{save.isPending ? 'Saving…' : 'Save draft'}</Button></div>
  </form>;
}
