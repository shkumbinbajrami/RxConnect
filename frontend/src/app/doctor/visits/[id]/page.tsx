import { Suspense } from 'react';
import { DoctorVisitDetailPage } from '@/features/visit/components/doctor-visit-detail-page';

async function VisitContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoctorVisitDetailPage visitId={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading visit…</p>}><VisitContent params={params} /></Suspense>;
}
