'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  return <form className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-5" onSubmit={(event) => { event.preventDefault(); if (items.some((item) => !item.medicineId || !item.dosageInstructions.trim() || item.quantity < 1) || new Set(items.map((item) => item.medicineId)).size !== items.length) { setValidation('Choose distinct medicines, quantities, and instructions for every line.'); return; } setValidation(''); save.mutate(); }}><div><h2 className="text-lg font-semibold">{draft ? 'Edit prescription draft' : 'Write prescription'}</h2><p className="text-sm text-slate-500">Choose catalog medicines. Quantities use each medicine’s stock unit.</p></div>
    {catalog.isPending && <p className="text-sm text-slate-500">Loading medicines…</p>}{catalog.isError && <Feedback message={catalog.error.message} />}
    {items.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)_auto]"><div className="space-y-2"><Label htmlFor={`medicine-${index}`}>Medicine</Label><select id={`medicine-${index}`} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={item.medicineId} onChange={(event) => setLine(index, { medicineId: event.target.value })} required><option value="">Choose medicine</option>{medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name} {medicine.strength ?? ''} · {medicine.unit}</option>)}</select></div><div className="space-y-2"><Label htmlFor={`quantity-${index}`}>Quantity</Label><Input id={`quantity-${index}`} type="number" min={1} step={1} value={item.quantity} onChange={(event) => setLine(index, { quantity: Number(event.target.value) })} required /></div><div className="space-y-2"><Label htmlFor={`instructions-${index}`}>Dosage instructions</Label><Input id={`instructions-${index}`} value={item.dosageInstructions} maxLength={1000} onChange={(event) => setLine(index, { dosageInstructions: event.target.value })} placeholder="How the patient should take it" required /></div><Button type="button" size="icon" variant="outline" aria-label="Remove medicine" className="self-end" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, position) => position !== index))}><Trash2 className="size-4" /></Button></div>)}
    <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, emptyLine()])}><Plus className="size-4" /> Add medicine</Button>{validation && <Feedback message={validation} />}{save.isError && <Feedback message={save.error.message} />}
    <div className="flex gap-3"><Button type="submit" disabled={save.isPending || catalog.isPending} className="bg-emerald-700 hover:bg-emerald-800">{save.isPending ? 'Saving…' : 'Save draft'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
