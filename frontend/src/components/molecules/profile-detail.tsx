export function ProfileDetail({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="mt-2 text-sm font-medium text-slate-900">{value || 'Not provided yet'}</dd>
  </div>;
}
