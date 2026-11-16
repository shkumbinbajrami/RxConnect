import { DateText } from '@/components/atoms/date-text';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Prescription } from '../types';

export function PrescriptionCard({ prescription, children }: { prescription: Prescription; children?: React.ReactNode }) {
  return <Card className="border-slate-200 bg-white"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">{prescription.patient.fullName || 'Patient'} · {prescription.doctor.fullName || 'Doctor'}</CardTitle><p className="mt-1 text-xs text-slate-500">Created <DateText value={prescription.createdAt} />{prescription.expiresAt && <> · Expires <DateText value={prescription.expiresAt} /></>}</p></div><StatusBadge status={prescription.status} /></div></CardHeader><CardContent className="space-y-4"><ul className="divide-y divide-slate-100">{prescription.items.map((item) => <li key={item.id} className="py-3 first:pt-0 last:pb-0"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{item.medicineName} {item.strength}</span><span className="text-sm text-slate-600">{item.remaining} of {item.quantity} {item.unit} remaining</span></div><p className="mt-1 text-sm text-slate-500">{item.dosageInstructions}</p></li>)}</ul>{children}</CardContent></Card>;
}
