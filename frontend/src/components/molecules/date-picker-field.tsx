'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function DatePickerField({ id, label, value, onChange, minDate, hint }: { id: string; label: string; value: string; onChange: (value: string) => void; minDate?: Date; hint?: string }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const today = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button id={id} type="button" variant="outline" className="h-11 w-full justify-start border-slate-200 bg-white font-normal" />}><CalendarDays className="size-4 text-emerald-700" />{selected ? selected.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Choose a date'}</PopoverTrigger><PopoverContent align="start" className="w-auto p-2"><Calendar mode="single" selected={selected} disabled={today ? { before: today } : undefined} onSelect={(next) => { if (next) { onChange(localDate(next)); setOpen(false); } }} weekStartsOn={1} /></PopoverContent></Popover>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>;
}
