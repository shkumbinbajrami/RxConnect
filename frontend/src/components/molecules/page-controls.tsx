'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSelect } from './filter-select';

const sizes = [10, 20, 50, 100].map((size) => ({ value: String(size), label: String(size) }));

export function PageControls({ page, totalPages, total, limit, onPageChange, onLimitChange }: { page: number; totalPages: number; total: number; limit: number; onPageChange: (page: number) => void; onLimitChange: (limit: number) => void }) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages].filter((item) => item >= 1 && item <= totalPages))].sort((a, b) => a - b);
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  return <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
    <div className="flex flex-wrap items-center gap-4"><span className="font-medium tabular-nums text-slate-700">{first}–{last} of {total}</span><div className="flex items-center gap-2"><span>Rows per page</span><FilterSelect id="page-size" label="Rows per page" value={String(limit)} options={sizes} onChange={(value) => onLimitChange(Number(value))} compact /></div></div>
    {totalPages > 1 && <nav aria-label="Table pages" className="flex flex-wrap items-center gap-1"><Button type="button" variant="outline" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-9 w-9 border-slate-200 bg-white p-0"><ChevronLeft className="size-4" /></Button>{pages.map((item, index) => <span key={item} className="flex items-center gap-1">{index > 0 && item - pages[index - 1] > 1 && <span className="px-1 text-slate-400" aria-hidden="true">…</span>}<Button type="button" variant="outline" aria-label={`Page ${item}`} aria-current={item === page ? 'page' : undefined} onClick={() => onPageChange(item)} className={`h-9 min-w-9 border-slate-200 px-2.5 tabular-nums ${item === page ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 hover:text-white' : 'bg-white'}`}>{item}</Button></span>)}<Button type="button" variant="outline" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-9 w-9 border-slate-200 bg-white p-0"><ChevronRight className="size-4" /></Button></nav>}
  </div>;
}
