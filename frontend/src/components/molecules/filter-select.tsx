'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

type Option = { value: string; label: string };

export function FilterSelect({ id, label, value, options, onChange, compact = false }: { id: string; label: string; value: string; options: Option[]; onChange: (value: string) => void; compact?: boolean }) {
  const emptyValue = '__all';
  const displayValue = options.find((option) => option.value === value)?.label ?? options[0]?.label;
  return <Select value={value || emptyValue} onValueChange={(next) => onChange(next === emptyValue ? '' : next ?? '')}>
    <SelectTrigger id={id} aria-label={label} className={`${compact ? 'h-9 min-w-20' : 'h-10 min-w-36'} rounded-lg border-slate-200 bg-white px-3 text-slate-700 shadow-none`}><span className="min-w-0 flex-1 truncate text-left">{displayValue}</span></SelectTrigger>
    <SelectContent>{options.map((option) => <SelectItem key={option.value || emptyValue} value={option.value || emptyValue}>{option.label}</SelectItem>)}</SelectContent>
  </Select>;
}
