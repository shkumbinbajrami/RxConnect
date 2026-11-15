'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export const OTHER_VALUE = '__other';

export function PresetSelectField({ id, label, value, onChange, options, placeholder, customValue, onCustomChange, customPlaceholder, customMaxLength, hint, optional = false }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  customValue: string;
  onCustomChange: (value: string) => void;
  customPlaceholder: string;
  customMaxLength: number;
  hint?: string;
  optional?: boolean;
}) {
  const displayValue = value === '__none' ? 'Not specified' : value === OTHER_VALUE ? 'Other' : options.find((option) => option.value === value)?.label ?? placeholder;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Select value={value} onValueChange={(nextValue) => onChange(nextValue ?? '')}><SelectTrigger id={id} className="h-11 w-full bg-white"><span className={`flex-1 truncate text-left ${!value ? 'text-slate-500' : ''}`}>{displayValue}</span></SelectTrigger><SelectContent>{optional && <SelectItem value="__none">Not specified</SelectItem>}{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}<SelectItem value={OTHER_VALUE}>Other</SelectItem></SelectContent></Select>{value === OTHER_VALUE && <Input aria-label={`Other ${label.toLowerCase()}`} value={customValue} onChange={(event) => onCustomChange(event.target.value)} placeholder={customPlaceholder} maxLength={customMaxLength} required className="h-11 bg-white" />}{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>;
}
