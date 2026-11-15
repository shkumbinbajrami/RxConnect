import { Cross } from 'lucide-react';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="inline-flex items-center gap-3 font-semibold tracking-tight text-slate-950">
    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/20"><Cross className="size-5" strokeWidth={2.5} /></span>
    {!compact && <span className="text-xl">RxConnect<span className="text-emerald-700">.</span></span>}
  </div>;
}
