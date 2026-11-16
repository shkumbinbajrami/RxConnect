'use client';

import { useState } from 'react';
import { DatePickerField } from '@/components/molecules/date-picker-field';
import { Button } from '@/components/ui/button';

export function PrescriptionExpiryForm({ pending, onIssue, onCancel }: { pending: boolean; onIssue: (expiresAt: string) => void; onCancel: () => void }) {
  const [date, setDate] = useState('');
  return <form className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4" onSubmit={(event) => { event.preventDefault(); if (date) onIssue(new Date(`${date}T23:59:59.999`).toISOString()); }}><h3 className="font-semibold text-slate-900">Issue prescription</h3><DatePickerField id="prescription-expiry" label="Prescription expires" value={date} onChange={setDate} minDate={new Date()} hint="Valid until the end of the selected day." /><div className="flex flex-wrap gap-2"><Button type="submit" disabled={!date || pending} className="bg-emerald-700 hover:bg-emerald-800">{pending ? 'Issuing…' : 'Confirm issue'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form>;
}
