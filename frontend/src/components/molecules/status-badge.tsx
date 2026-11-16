import { Badge } from '@/components/ui/badge';

const tones: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800', AVAILABLE: 'bg-emerald-100 text-emerald-800',
  ISSUED: 'bg-emerald-100 text-emerald-800', COMPLETED: 'bg-emerald-100 text-emerald-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800', PLANNED: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-amber-100 text-amber-900', EXPIRED: 'bg-amber-100 text-amber-900',
  CANCELLED: 'bg-slate-100 text-slate-700', DISCONTINUED: 'bg-slate-100 text-slate-700',
  REVERSED: 'bg-slate-100 text-slate-700', INACTIVE: 'bg-slate-100 text-slate-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="secondary" className={tones[status.toUpperCase()] ?? 'bg-slate-100 text-slate-700'}>{status.toLowerCase().replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase())}</Badge>;
}
