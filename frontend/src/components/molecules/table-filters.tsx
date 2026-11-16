'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterSelect } from './filter-select';

type Option = { value: string; label: string };

export function TableFilters({ search, onSearchChange, searchLabel, searchPlaceholder, filterId, filterLabel, filterValue, filterOptions, onFilterChange, loading = false }: { search: string; onSearchChange: (value: string) => void; searchLabel: string; searchPlaceholder: string; filterId: string; filterLabel: string; filterValue: string; filterOptions: Option[]; onFilterChange: (value: string) => void; loading?: boolean }) {
  return <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-52 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label={searchLabel} value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} className="h-10 w-full rounded-lg border-slate-200 bg-white pl-10" /></div><FilterSelect id={filterId} label={filterLabel} value={filterValue} options={filterOptions} onChange={onFilterChange} /><span role="status" className="text-xs text-slate-500">{loading ? 'Updating results…' : ''}</span></div>;
}
