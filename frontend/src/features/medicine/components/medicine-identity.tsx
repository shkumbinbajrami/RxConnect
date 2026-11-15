import { Pill } from 'lucide-react';
import type { Medicine } from '../types';

export function MedicineIdentity({ medicine }: { medicine: Pick<Medicine, 'name' | 'strength' | 'form'> }) {
  const detail = [medicine.strength, medicine.form].filter(Boolean).join(' · ');
  return <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Pill className="size-5" /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{medicine.name}</p>{detail && <p className="mt-0.5 truncate text-xs text-slate-500">{detail}</p>}</div></div>;
}
