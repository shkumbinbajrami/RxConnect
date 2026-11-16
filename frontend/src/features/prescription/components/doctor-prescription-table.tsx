'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateText } from '@/components/atoms/date-text';
import { DeleteConfirm } from '@/components/molecules/delete-confirm';
import { EmptyState } from '@/components/molecules/empty-state';
import { Feedback } from '@/components/molecules/feedback';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cancelPrescription, deletePrescription, issuePrescription, prescriptionKeys } from '../api';
import type { Prescription } from '../types';
import { PrescriptionForm } from './prescription-form';
import { PrescriptionExpiryForm } from './prescription-expiry-form';

type DrawerMode = 'view' | 'edit' | 'issue' | 'delete' | 'cancel';
const drawerWidth = { '--drawer-content-width': 'min(100vw, 38rem)' } as CSSProperties;

export function DoctorPrescriptionTable({ prescriptions, showVisit = false }: { prescriptions: Prescription[]; showVisit?: boolean }) {
  const client = useQueryClient();
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [mode, setMode] = useState<DrawerMode>('view');
  const action = useMutation({ mutationFn: async (input: { kind: 'issue' | 'cancel' | 'delete'; id: string; expiresAt?: string }) => input.kind === 'issue' ? issuePrescription(input.id, input.expiresAt!) : input.kind === 'cancel' ? cancelPrescription(input.id) : deletePrescription(input.id), onSuccess: () => { setSelected(null); setMode('view'); void client.invalidateQueries({ queryKey: prescriptionKeys.all }); } });
  const open = (prescription: Prescription, nextMode: DrawerMode) => { action.reset(); setSelected(prescription); setMode(nextMode); };
  const close = () => { setSelected(null); setMode('view'); };

  if (prescriptions.length === 0) return <EmptyState title="No prescriptions yet" description="Open an in-progress visit to write a prescription." />;
  return <>
    <DataTable headers={['Patient', 'Medicines', 'Created', 'Expires', 'Status', ...(showVisit ? ['Visit'] : []), 'Actions']}>
      {prescriptions.map((prescription) => <tr key={prescription.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{prescription.patient.fullName || 'Patient'}</td><td className="px-4 py-4">{prescription.items.length} medicine{prescription.items.length === 1 ? '' : 's'}</td><td className="px-4 py-4"><DateText value={prescription.createdAt} /></td><td className="px-4 py-4"><DateText value={prescription.expiresAt} /></td><td className="px-4 py-4"><StatusBadge status={prescription.status} /></td>{showVisit && <td className="px-4 py-4"><Link href={`/doctor/visits/${prescription.visitId}`} className="font-medium text-emerald-700 hover:underline">View visit</Link></td>}<td className="px-4 py-4"><TableActions><Button size="sm" variant="outline" onClick={() => open(prescription, 'view')}>View</Button>{!showVisit && prescription.status === 'DRAFT' && <><Button size="sm" variant="outline" onClick={() => open(prescription, 'edit')}>Edit</Button><Button size="sm" onClick={() => open(prescription, 'issue')}>Issue</Button><Button size="sm" variant="destructive" onClick={() => open(prescription, 'delete')}>Delete</Button></>}{!showVisit && prescription.status === 'ISSUED' && <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => open(prescription, 'cancel')}>Cancel</Button>}</TableActions></td></tr>)}
    </DataTable>
    <Drawer open={Boolean(selected)} onOpenChange={(isOpen) => { if (!isOpen) close(); }} swipeDirection="right">
      <DrawerContent style={drawerWidth}>
        {selected && <>
          <DrawerHeader className="border-b border-slate-200 px-6 py-5"><div className="flex items-start justify-between gap-4"><div className="space-y-1"><DrawerTitle className="text-xl font-semibold">Prescription for {selected.patient.fullName || 'patient'}</DrawerTitle><DrawerDescription>Review medicines and instructions for this prescription.</DrawerDescription></div><StatusBadge status={selected.status} /></div></DrawerHeader>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Created</span><DateText value={selected.createdAt} /></div><div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Expires</span><DateText value={selected.expiresAt} /></div></div>
            <section className="space-y-3"><h3 className="font-semibold text-slate-900">Medicines</h3><ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">{selected.items.map((item) => <li key={item.id} className="space-y-1 py-4 text-sm"><p className="font-medium text-slate-900">{item.medicineName} {item.strength}</p><p className="text-slate-600">{item.remaining} of {item.quantity} {item.unit} remaining</p><p className="text-slate-500">{item.dosageInstructions}</p></li>)}</ul></section>
            {showVisit && <Button render={<Link href={`/doctor/visits/${selected.visitId}`} />} variant="outline" onClick={close}>Open visit details</Button>}
            {mode === 'edit' && <PrescriptionForm key={selected.id} visitId={selected.visitId} draft={selected} onSaved={close} onCancel={() => setMode('view')} />}
            {mode === 'issue' && <PrescriptionExpiryForm pending={action.isPending} onIssue={(expiresAt) => action.mutate({ kind: 'issue', id: selected.id, expiresAt })} onCancel={() => setMode('view')} />}
            {mode === 'cancel' && <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><p className="font-semibold text-amber-950">Cancel this prescription?</p><p className="text-amber-900">The patient’s code will stop working, and no more medicines can be dispensed from it.</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setMode('view')}>Keep prescription</Button><Button type="button" variant="destructive" disabled={action.isPending} onClick={() => action.mutate({ kind: 'cancel', id: selected.id })}>Cancel prescription</Button></div></div>}
            {mode === 'delete' && <DeleteConfirm label="draft prescription" pending={action.isPending} onConfirm={() => action.mutate({ kind: 'delete', id: selected.id })} onCancel={() => setMode('view')} />}
            {action.isError && <Feedback message={action.error.message} />}
          </div>
          <DrawerFooter className="border-t border-slate-200 px-6 py-4"><DrawerClose render={<Button type="button" variant="outline" className="w-full" />}>Close</DrawerClose></DrawerFooter>
        </>}
      </DrawerContent>
    </Drawer>
  </>;
}
