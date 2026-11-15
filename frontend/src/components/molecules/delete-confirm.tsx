import { Button } from '@/components/ui/button';

export function DeleteConfirm({ label, pending, onConfirm, onCancel }: {
  label: string; pending: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2"><span className="mr-auto text-xs font-medium text-red-800">Remove {label}?</span><Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button><Button type="button" size="sm" variant="destructive" onClick={onConfirm} disabled={pending}>{pending ? 'Removing…' : 'Remove'}</Button></div>;
}
