'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DateText } from '@/components/atoms/date-text';
import { EmptyState } from '@/components/molecules/empty-state';
import { DataTable } from '@/components/organisms/data-table';
import { StatusBadge } from '@/components/molecules/status-badge';
import type { Visit } from '../types';

export function VisitList({ visits, role, filtered = false }: { visits: Visit[]; role: 'DOCTOR' | 'PATIENT'; filtered?: boolean }) {
  const router = useRouter();
  if (visits.length === 0) return <EmptyState title={filtered ? 'No matching visits' : 'No visits yet'} description={filtered ? 'Try another search term or status.' : role === 'DOCTOR' ? 'Create a visit to begin caring for a patient.' : 'Your doctor visits will appear here.'} />;
  return <DataTable headers={[role === 'DOCTOR' ? 'Patient' : 'Doctor', 'Scheduled / started', 'Status', ...(role === 'DOCTOR' ? ['Notes'] : [])]}>
    {visits.map((visit) => <tr key={visit.id} className="cursor-pointer hover:bg-emerald-50/70" onClick={() => router.push(`/${role.toLowerCase()}/visits/${visit.id}`)}>
      <td className="px-4 py-4 font-semibold text-slate-900"><Link href={`/${role.toLowerCase()}/visits/${visit.id}`} className="text-emerald-800 hover:underline" onClick={(event) => event.stopPropagation()}>{role === 'DOCTOR' ? visit.patientName || 'Patient' : visit.doctorName || 'Doctor'}</Link></td>
      <td className="px-4 py-4"><DateText value={visit.scheduledAt || visit.startedAt || visit.createdAt} /></td>
      <td className="px-4 py-4"><StatusBadge status={visit.status} /></td>
      {role === 'DOCTOR' && <td className="max-w-48 truncate px-4 py-4" title={visit.notes || ''}>{visit.notes || '—'}</td>}
    </tr>)}
  </DataTable>;
}
