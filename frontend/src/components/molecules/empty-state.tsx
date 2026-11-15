import { PackageOpen } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><PackageOpen className="size-6" /></span><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p></div>;
}
