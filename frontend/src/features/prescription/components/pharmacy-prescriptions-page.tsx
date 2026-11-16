'use client';

import { useDeferredValue, useState, type CSSProperties } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Search } from 'lucide-react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { PageControls } from '@/components/molecules/page-controls';
import { TableFilters } from '@/components/molecules/table-filters';
import { DateText } from '@/components/atoms/date-text';
import { DataTable, TableActions } from '@/components/organisms/data-table';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrescriptionCard } from './prescription-card';
import { QrScanner } from './qr-scanner';
import { dispensePrescription, lookupPrescription, prescriptionKeys, reverseDispense, searchPharmacyDispenses } from '../api';
import type { Dispense, Prescription, PrescriptionItem } from '../types';

type Credential = { code: string } | { qrToken: string };
const drawerWidth = { '--drawer-content-width': 'min(100vw, 42rem)' } as CSSProperties;

function DispenseForm({ prescription, credential, onDone }: { prescription: Prescription; credential: Credential; onDone: () => void }) {
  const client = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const save = useMutation({ mutationFn: () => dispensePrescription(prescription.id, { ...credential, items: prescription.items.filter((item) => item.remaining > 0 && quantities[item.id] > 0).map((item) => ({ prescriptionItemId: item.id, quantity: quantities[item.id] })) }), onSuccess: () => { void client.invalidateQueries({ queryKey: prescriptionKeys.all }); onDone(); } });
  const remaining = prescription.items.filter((item) => item.remaining > 0);
  return <form className="space-y-4 rounded-xl border border-emerald-200 p-4" onSubmit={(event) => { event.preventDefault(); if (remaining.some((item) => quantities[item.id] && (!Number.isInteger(quantities[item.id]) || quantities[item.id] > item.remaining))) return; save.mutate(); }}><h3 className="font-semibold">Dispense medicines</h3><p className="text-sm text-slate-500">Enter only what you are giving the patient now. A partial fill leaves the rest available.</p>{remaining.length === 0 ? <p className="text-sm text-slate-600">This prescription has been fully dispensed.</p> : remaining.map((item: PrescriptionItem) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm">{item.medicineName} {item.strength}</strong><p className="text-xs text-slate-500">{item.remaining} {item.unit} remaining</p></div><div className="w-32 space-y-1"><Label htmlFor={`fill-${item.id}`}>Give now</Label><Input id={`fill-${item.id}`} type="number" min={0} max={item.remaining} step={1} value={quantities[item.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))} /></div></div>)}{save.isError && <Feedback message={save.error.message} />}<Button type="submit" disabled={save.isPending || !remaining.some((item) => quantities[item.id] > 0)} className="bg-emerald-700 hover:bg-emerald-800">Confirm dispense</Button></form>;
}

function LookupDrawer({ prescription, credential, onClose, onDone }: { prescription: Prescription | null; credential: Credential | null; onClose: () => void; onDone: () => void }) {
  return <Drawer open={Boolean(prescription && credential)} onOpenChange={(open) => { if (!open) onClose(); }} swipeDirection="right"><DrawerContent style={drawerWidth}>{prescription && credential && <><DrawerHeader className="border-b border-slate-200 px-6 py-5"><DrawerTitle className="text-xl font-semibold">Prescription for {prescription.patient.fullName || 'patient'}</DrawerTitle><DrawerDescription>Check the medicines and record what you give the patient.</DrawerDescription></DrawerHeader><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5"><PrescriptionCard prescription={prescription}><DispenseForm key={prescription.id + JSON.stringify(credential)} prescription={prescription} credential={credential} onDone={onDone} /></PrescriptionCard></div><DrawerFooter className="border-t border-slate-200 px-6 py-4"><DrawerClose render={<Button type="button" variant="outline" className="w-full" />}>Close</DrawerClose></DrawerFooter></>}</DrawerContent></Drawer>;
}

function HistoryDrawer({ dispense, onClose, onReversed }: { dispense: Dispense | null; onClose: () => void; onReversed: () => void }) {
  const [reason, setReason] = useState('');
  const reverse = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => reverseDispense(id, reason), onSuccess: onReversed });
  return <Drawer open={Boolean(dispense)} onOpenChange={(open) => { if (!open) onClose(); }} swipeDirection="right"><DrawerContent style={drawerWidth}>{dispense && <><DrawerHeader className="border-b border-slate-200 px-6 py-5"><div className="flex items-start justify-between gap-3"><div><DrawerTitle className="text-xl font-semibold">Dispense for {dispense.prescription?.visit.patient.fullName || 'patient'}</DrawerTitle><DrawerDescription><DateText value={dispense.dispensedAt} /></DrawerDescription></div><StatusBadge status={dispense.status} /></div></DrawerHeader><div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5"><section className="space-y-3"><h3 className="font-semibold">Medicines given</h3><ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">{dispense.items.map((item) => <li key={item.id} className="py-3 text-sm">{item.quantity} {item.unit} · {item.unitPrice} {item.currency} per unit</li>)}</ul></section>{dispense.status === 'REVERSED' && dispense.reversalReason && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Reversal reason: {dispense.reversalReason}</p>}{dispense.status === 'COMPLETED' && <form className="space-y-3 rounded-xl border border-slate-200 p-4" onSubmit={(event) => { event.preventDefault(); reverse.mutate({ id: dispense.id, reason: reason.trim() }); }}><h3 className="font-semibold">Reverse this fill</h3><div className="space-y-2"><Label htmlFor={`reason-${dispense.id}`}>Reason for reversal</Label><Input id={`reason-${dispense.id}`} value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} required /></div><Button type="submit" variant="destructive" disabled={reverse.isPending || !reason.trim()}>Reverse fill</Button>{reverse.isError && <Feedback message={reverse.error.message} />}</form>}</div><DrawerFooter className="border-t border-slate-200 px-6 py-4"><DrawerClose render={<Button type="button" variant="outline" className="w-full" />}>Close</DrawerClose></DrawerFooter></>}</DrawerContent></Drawer>;
}

function PharmacyPrescriptionContent({ userId }: { userId: string }) {
  const client = useQueryClient();
  const [code, setCode] = useState('');
  const [credential, setCredential] = useState<Credential | null>(null);
  const [found, setFound] = useState<Prescription | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Dispense['status'] | ''>('');
  const deferredSearch = useDeferredValue(search);
  const lookup = useMutation({ mutationFn: lookupPrescription, onSuccess: (prescription, input) => { setFound(prescription); setCredential(input.code ? { code: input.code } : { qrToken: input.qrToken! }); setScanning(false); } });
  const history = useQuery({ queryKey: [...prescriptionKeys.pharmacyDispenses(userId), page, limit, deferredSearch, status], queryFn: () => searchPharmacyDispenses({ page, limit, search: deferredSearch, status }), placeholderData: keepPreviousData });
  const selected = history.data?.items.find((item) => item.id === selectedId) ?? null;
  const closeLookup = () => { setFound(null); setCredential(null); };
  const changePage = (next: number) => { setSelectedId(null); setPage(next); };
  return <div className="space-y-8"><SectionHeading eyebrow="Pharmacy workspace" title="Fill prescriptions" description="Enter the patient’s code or scan their QR code, then record the medicines you dispense." />
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); closeLookup(); lookup.mutate({ code: code.trim() }); }}><div className="min-w-56 flex-1 space-y-2"><Label htmlFor="prescription-code">Prescription code</Label><Input id="prescription-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code shown by patient" required /></div><Button type="submit" disabled={lookup.isPending}><Search className="size-4" /> Find prescription</Button><Button type="button" variant="outline" onClick={() => setScanning(!scanning)}><Camera className="size-4" /> Scan QR</Button></form>{scanning && <QrScanner onScan={(token) => { closeLookup(); lookup.mutate({ qrToken: token }); }} onClose={() => setScanning(false)} />}{lookup.isError && <Feedback message={lookup.error.message} />}</div>
    <section className="space-y-4"><div><h2 className="text-xl font-semibold">Your dispensing history</h2><p className="mt-1 text-sm text-slate-500">Search and review prescriptions you have filled.</p></div><TableFilters loading={history.isFetching} search={search} onSearchChange={(value) => { setSearch(value); setPage(1); setSelectedId(null); }} searchLabel="Search dispensing history" searchPlaceholder="Search patient or medicine" filterId="dispense-status" filterLabel="Filter dispense status" filterValue={status} filterOptions={[{ value: '', label: 'All statuses' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'REVERSED', label: 'Reversed' }]} onFilterChange={(value) => { setStatus(value as Dispense['status'] | ''); setPage(1); setSelectedId(null); }} />
      {history.isPending ? <p className="text-sm text-slate-500">Loading history…</p> : history.isError ? <Feedback message={history.error.message} /> : <>{history.data.items.length === 0 ? <EmptyState title={search || status ? 'No matching fills' : 'No medicines dispensed yet'} description={search || status ? 'Try a different search or status.' : 'Completed prescription fills will appear here.'} /> : <DataTable headers={['Patient', 'Dispensed', 'Medicines', 'Status', 'Actions']}>{history.data.items.map((dispense) => <tr key={dispense.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-semibold text-slate-900">{dispense.prescription?.visit.patient.fullName || 'Patient'}</td><td className="px-4 py-4"><DateText value={dispense.dispensedAt} /></td><td className="px-4 py-4">{dispense.items.length} line{dispense.items.length === 1 ? '' : 's'} · {dispense.items.reduce((sum, item) => sum + item.quantity, 0)} units</td><td className="px-4 py-4"><StatusBadge status={dispense.status} /></td><td className="px-4 py-4"><TableActions><Button type="button" size="sm" variant="outline" onClick={() => setSelectedId(dispense.id)}>View</Button></TableActions></td></tr>)}</DataTable>}<PageControls page={history.data.page} totalPages={history.data.totalPages} total={history.data.total} limit={limit} onPageChange={changePage} onLimitChange={(next) => { setSelectedId(null); setLimit(next); setPage(1); }} /></>}
    </section>
    <LookupDrawer prescription={found} credential={credential} onClose={closeLookup} onDone={() => { closeLookup(); setCode(''); void client.invalidateQueries({ queryKey: prescriptionKeys.pharmacyDispenses(userId) }); }} />
    <HistoryDrawer key={selected?.id ?? 'none'} dispense={selected} onClose={() => setSelectedId(null)} onReversed={() => { setSelectedId(null); void client.invalidateQueries({ queryKey: prescriptionKeys.pharmacyDispenses(userId) }); }} />
  </div>;
}

export function PharmacyPrescriptionsPage() { return <WorkspacePage role="PHARMACY" page="Prescriptions">{(user) => <PharmacyPrescriptionContent userId={user.id} />}</WorkspacePage>; }
