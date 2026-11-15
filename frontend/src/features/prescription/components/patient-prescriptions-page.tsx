'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { DateText } from '@/components/atoms/date-text';
import { Button } from '@/components/ui/button';
import { PrescriptionCard } from './prescription-card';
import { getPrescriptionAccess, listFills, listPharmacyOptions, listPrescriptions, prescriptionKeys } from '../api';
import type { Prescription } from '../types';

function PatientPrescriptionDetails({ prescription }: { prescription: Prescription }) {
  const [showCode, setShowCode] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showFills, setShowFills] = useState(false);
  const access = useQuery({ queryKey: prescriptionKeys.access(prescription.id), queryFn: () => getPrescriptionAccess(prescription.id), enabled: showCode && prescription.status === 'ISSUED' });
  const options = useQuery({ queryKey: prescriptionKeys.pharmacies(prescription.id), queryFn: () => listPharmacyOptions(prescription.id), enabled: showOptions && prescription.status === 'ISSUED' });
  const fills = useQuery({ queryKey: prescriptionKeys.fills(prescription.id), queryFn: () => listFills(prescription.id), enabled: showFills });
  return <PrescriptionCard prescription={prescription}><div className="flex flex-wrap gap-2">{prescription.status === 'ISSUED' && <><Button size="sm" onClick={() => setShowCode(!showCode)}>{showCode ? 'Hide code' : 'Show code & QR'}</Button><Button size="sm" variant="outline" onClick={() => setShowOptions(!showOptions)}>Find pharmacies</Button></>}<Button size="sm" variant="outline" onClick={() => setShowFills(!showFills)}>Dispense history</Button></div>
    {showCode && (access.isPending ? <p className="text-sm text-slate-500">Loading code…</p> : access.isError ? <Feedback message={access.error.message} /> : access.data && <div className="space-y-3 rounded-xl bg-emerald-50 p-5"><p className="text-sm text-slate-600">Show this code or QR to a pharmacy. Expires <DateText value={access.data.expiresAt} />.</p><p className="break-all font-mono text-2xl font-bold tracking-wider">{access.data.code}</p><Image unoptimized width={220} height={220} alt="Prescription QR code" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(access.data.qrSvg)}`} className="rounded-lg bg-white p-2" /></div>)}
    {showOptions && (options.isPending ? <p className="text-sm text-slate-500">Checking pharmacy stock…</p> : options.isError ? <Feedback message={options.error.message} /> : options.data?.length === 0 ? <p className="text-sm text-slate-500">No pharmacy currently lists the remaining medicines in stock.</p> : <div className="space-y-3">{options.data?.map((option) => <div key={option.pharmacyId} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{option.pharmacyName || 'Pharmacy'}</strong><span className="text-sm text-emerald-700">{option.canFillAll ? 'All remaining medicines available' : `${option.availableItemCount} medicine types available`}</span></div><p className="text-sm text-slate-500">{option.address}</p><ul className="mt-2 text-sm text-slate-600">{option.medicines.map((item) => <li key={item.prescriptionItemId}>{prescription.items.find((line) => line.id === item.prescriptionItemId)?.medicineName}: {item.available} available, {item.remaining} needed</li>)}</ul></div>)}</div>)}
    {showFills && (fills.isPending ? <p className="text-sm text-slate-500">Loading history…</p> : fills.isError ? <Feedback message={fills.error.message} /> : fills.data?.length === 0 ? <p className="text-sm text-slate-500">Nothing dispensed yet.</p> : <ul className="space-y-2">{fills.data?.map((fill) => <li key={fill.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{fill.pharmacy?.pharmacyName || 'Pharmacy'}</strong> · <DateText value={fill.dispensedAt} /> · {fill.status}<span className="block text-slate-600">{fill.items.map((item) => `${prescription.items.find((line) => line.id === item.prescriptionItemId)?.medicineName}: ${item.quantity}`).join(', ')}</span></li>)}</ul>)}
  </PrescriptionCard>;
}

export function PatientPrescriptionsPage() { return <WorkspacePage role="PATIENT" page="Prescriptions">{(user) => <PatientPrescriptionContent userId={user.id} />}</WorkspacePage>; }
function PatientPrescriptionContent({ userId }: { userId: string }) {
  const prescriptions = useQuery({ queryKey: prescriptionKeys.list(userId), queryFn: listPrescriptions });
  return <div className="space-y-7"><SectionHeading eyebrow="Patient workspace" title="Your prescriptions" description="See your medicines, remaining quantities, pharmacy availability, and the code to share when collecting them." />{prescriptions.isPending ? <p className="text-sm text-slate-500">Loading prescriptions…</p> : prescriptions.isError ? <Feedback message={prescriptions.error.message} /> : prescriptions.data.length === 0 ? <EmptyState title="No prescriptions yet" description="Your doctor’s issued prescriptions will appear here." /> : prescriptions.data.map((prescription) => <PatientPrescriptionDetails key={prescription.id} prescription={prescription} />)}</div>;
}
