'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { FormField } from '@/components/molecules/form-field';
import { OTHER_VALUE, PresetSelectField } from '@/components/molecules/preset-select-field';
import { Feedback } from '@/components/molecules/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createMedicine, medicineKeys, updateMedicine } from '../api';
import type { Medicine, MedicineInput } from '../types';

const formOptions = [
  { value: 'tablets', label: 'Tablets' }, { value: 'capsules', label: 'Capsules' },
  { value: 'syrup', label: 'Syrup' }, { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' }, { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' }, { value: 'inhaler', label: 'Inhaler' },
];
const unitOptions = [
  { value: 'box', label: 'Box' }, { value: 'pack', label: 'Pack' },
  { value: 'bottle', label: 'Bottle' }, { value: 'tube', label: 'Tube' },
  { value: 'vial', label: 'Vial' }, { value: 'sachet', label: 'Sachet' },
  { value: 'piece', label: 'Piece' },
];
const currencyOptions = [
  { value: 'EUR', label: 'EUR — Euro' }, { value: 'ALL', label: 'ALL — Albanian lek' },
  { value: 'USD', label: 'USD — US dollar' },
];

function initialChoice(value: string | null | undefined, options: { value: string }[], optional = false) {
  if (!value) return optional ? '__none' : '';
  return options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.value ?? OTHER_VALUE;
}

export function MedicineForm({ medicine, onSaved, onCancel }: {
  medicine: Medicine | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [formChoice, setFormChoice] = useState(() => initialChoice(medicine?.form, formOptions, true));
  const [unitChoice, setUnitChoice] = useState(() => initialChoice(medicine?.unit, unitOptions));
  const [currencyChoice, setCurrencyChoice] = useState(() => initialChoice(medicine?.currency, currencyOptions));
  const [otherForm, setOtherForm] = useState(medicine?.form ?? '');
  const [otherUnit, setOtherUnit] = useState(medicine?.unit ?? '');
  const [otherCurrency, setOtherCurrency] = useState(medicine?.currency ?? '');
  const [selectionError, setSelectionError] = useState('');
  const save = useMutation({
    mutationFn: (input: MedicineInput) => medicine ? updateMedicine(medicine.id, input) : createMedicine(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: medicineKeys.all });
      onSaved();
    },
  });

  return <Card className="border border-emerald-200 bg-white shadow-sm ring-0">
    <CardHeader><CardTitle className="text-lg">{medicine ? 'Edit medicine' : 'Add medicine'}</CardTitle><CardDescription>Set the shared catalog price and the unit pharmacies will count in stock.</CardDescription></CardHeader>
    <CardContent><form className="space-y-6" onSubmit={(event) => {
      event.preventDefault();
      const form = formChoice === OTHER_VALUE ? otherForm.trim() : formChoice === '__none' ? '' : formChoice;
      const unit = unitChoice === OTHER_VALUE ? otherUnit.trim() : unitChoice;
      const currency = (currencyChoice === OTHER_VALUE ? otherCurrency.trim() : currencyChoice).toUpperCase();
      if (!unit || !/^[A-Z]{3}$/.test(currency)) { setSelectionError('Choose a stock unit and a valid three-letter currency.'); return; }
      setSelectionError('');
      const values = new FormData(event.currentTarget);
      save.mutate({
        name: String(values.get('name')).trim(),
        strength: String(values.get('strength')).trim(),
        form,
        unit,
        price: String(values.get('price')),
        currency,
        isActive: medicine ? values.has('isActive') : true,
      });
    }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Medicine name" name="name" defaultValue={medicine?.name ?? ''} maxLength={160} placeholder="e.g. Paracetamol" required />
        <FormField label="Strength" name="strength" defaultValue={medicine?.strength ?? ''} maxLength={80} placeholder="e.g. 500 mg" />
        <PresetSelectField id="medicine-form" label="Form" value={formChoice} onChange={setFormChoice} options={formOptions} placeholder="Choose a form" customValue={otherForm} onCustomChange={setOtherForm} customPlaceholder="Enter another form" customMaxLength={80} optional />
        <PresetSelectField id="medicine-unit" label="Stock unit" value={unitChoice} onChange={setUnitChoice} options={unitOptions} placeholder="Choose a stock unit" customValue={otherUnit} onCustomChange={setOtherUnit} customPlaceholder="Enter another unit" customMaxLength={40} hint="Quantity in pharmacy stock is counted in this unit." />
        <FormField label="Price per unit" name="price" type="number" min="0" max="99999999.99" step="0.01" defaultValue={medicine?.price ?? ''} placeholder="0.00" required />
        <PresetSelectField id="medicine-currency" label="Currency" value={currencyChoice} onChange={setCurrencyChoice} options={currencyOptions} placeholder="Choose a currency" customValue={otherCurrency} onCustomChange={setOtherCurrency} customPlaceholder="Enter three-letter code" customMaxLength={3} hint="Shared price currency for every pharmacy." />
      </div>
      {medicine && <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input name="isActive" type="checkbox" defaultChecked={medicine.isActive} className="size-4 accent-emerald-700" /> Active in the pharmacy catalog</label>}
      {save.isError && <Feedback message={save.error.message} />}
      {selectionError && <Feedback message={selectionError} />}
      <div className="flex flex-wrap gap-3"><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={save.isPending}>{save.isPending && <LoaderCircle className="size-4 animate-spin" />}{medicine ? 'Save changes' : 'Add medicine'}</Button><Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>Cancel</Button></div>
    </form></CardContent>
  </Card>;
}
