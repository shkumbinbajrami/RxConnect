'use client';

import { useState } from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const timeSlots = Array.from({ length: 96 }, (_, index) => `${String(Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`);

export function DateTimePicker({ name, label, initialValue, hint }: { name: string; label: string; initialValue?: string | null; hint?: string }) {
  const initial = initialValue ? new Date(initialValue) : null;
  const [date, setDate] = useState(initial && !Number.isNaN(initial.getTime()) ? localDate(initial) : '');
  const [time, setTime] = useState(initial && !Number.isNaN(initial.getTime()) ? `${String(initial.getHours()).padStart(2, '0')}:${String(initial.getMinutes()).padStart(2, '0')}` : '09:00');
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const selected = date ? new Date(`${date}T12:00:00`) : undefined;
  const value = date ? `${date}T${time}` : '';
  return <div className="space-y-2">
    <Label>{label}</Label>
    <input type="hidden" name={name} value={value} />
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger render={<Button type="button" variant="outline" className="h-11 min-w-48 justify-start bg-white font-normal" />}><CalendarDays className="size-4 text-emerald-700" />{selected ? selected.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Choose a date'}</PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2"><Calendar mode="single" selected={selected} onSelect={(next) => { if (next) { setDate(localDate(next)); setDateOpen(false); } }} weekStartsOn={1} /></PopoverContent>
      </Popover>
      <Popover open={timeOpen} onOpenChange={setTimeOpen}>
        <PopoverTrigger render={<Button type="button" variant="outline" className="h-11 min-w-28 justify-start bg-white font-normal" />}><Clock3 className="size-4 text-emerald-700" />{time}</PopoverTrigger>
        <PopoverContent align="start" className="w-[min(92vw,34rem)] p-3"><p className="pb-2 text-xs font-semibold text-slate-500">Choose a time</p><div className="grid max-h-64 grid-cols-4 gap-1 overflow-y-auto pr-1 sm:grid-cols-8">{timeSlots.map((slot) => <button key={slot} type="button" aria-pressed={time === slot} onClick={() => { setTime(slot); setTimeOpen(false); }} className={`rounded-md px-1.5 py-2 text-center text-xs font-medium hover:bg-emerald-50 ${time === slot ? 'bg-emerald-700 text-white hover:bg-emerald-700' : 'text-slate-700'}`}>{slot}</button>)}</div></PopoverContent>
      </Popover>
      {date && <Button type="button" variant="ghost" size="sm" onClick={() => setDate('')}><X className="size-4" /> Clear</Button>}
    </div>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>;
}
