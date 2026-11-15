'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Search } from 'lucide-react';
import { WorkspacePage } from '@/components/organisms/workspace-page';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Feedback } from '@/components/molecules/feedback';
import { EmptyState } from '@/components/molecules/empty-state';
import { DateText } from '@/components/atoms/date-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrescriptionCard } from './prescription-card';
import { QrScanner } from './qr-scanner';
import { dispensePrescription, listPharmacyDispenses, lookupPrescription, prescriptionKeys, reverseDispense } from '../api';
import type { Prescription, PrescriptionItem } from '../types';

type Credential = { code: string } | { qrToken: string };

function DispenseForm({ prescription, credential, onDone }: { prescription: Prescription; credential: Credential; onDone: () => void }) {
  const client = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const save = useMutation({ mutationFn: () => dispensePrescription(prescription.id, { ...credential, items: prescription.items.filter((item) => item.remaining > 0 && quantities[item.id] > 0).map((item) => ({ prescriptionItemId: item.id, quantity: quantities[item.id] })) }), onSuccess: () => { void client.invalidateQueries({ queryKey: prescriptionKeys.all }); onDone(); } });
  const remaining = prescription.items.filter((item) => item.remaining > 0);
  return <form className="space-y-4 rounded-xl border border-emerald-200 p-4" onSubmit={(event) => { event.preventDefault(); if (remaining.some((item) => quantities[item.id] && (!Number.isInteger(quantities[item.id]) || quantities[item.id] > item.remaining))) return; save.mutate(); }}><h3 className="font-semibold">Dispense medicines</h3><p className="text-sm text-slate-500">Enter only what you are giving the patient now. A partial fill leaves the rest available.</p>{remaining.length === 0 ? <p className="text-sm text-slate-600">This prescription has been fully dispensed.</p> : remaining.map((item: PrescriptionItem) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm">{item.medicineName} {item.strength}</strong><p className="text-xs text-slate-500">{item.remaining} {item.unit} remaining</p></div><div className="w-32 space-y-1"><Label htmlFor={`fill-${item.id}`}>Give now</Label><Input id={`fill-${item.id}`} type="number" min={0} max={item.remaining} step={1} value={quantities[item.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: Number(event.target.value) }))} /></div></div>)}{save.isError && <Feedback message={save.error.message} />}<Button type="submit" disabled={save.isPending || !remaining.some((item) => quantities[item.id] > 0)}>Confirm dispense</Button></form>;
}

function PharmacyPrescriptionContent({ userId }: { userId: string }) {
  const client = useQueryClient();
  const [code, setCode] = useState('');
  const [credential, setCredential] = useState<Credential | null>(null);
  const [found, setFound] = useState<Prescription | null>(null);
  const [scanning, setScanning] = useState(false);
  const [reversing, setReversing] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const lookup = useMutation({ mutationFn: lookupPrescription, onSuccess: (prescription, input) => { setFound(prescription); setCredential(input.code ? { code: input.code } : { qrToken: input.qrToken! }); setScanning(false); } });
  const history = useQuery({ queryKey: prescriptionKeys.pharmacyDispenses(userId), queryFn: listPharmacyDispenses });
  const reverse = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => reverseDispense(id, reason), onSuccess: () => { setReversing(null); setReason(''); setFound(null); setCredential(null); void client.invalidateQueries({ queryKey: prescriptionKeys.pharmacyDispenses(userId) }); } });
  return <div className="space-y-8"><SectionHeading eyebrow="Pharmacy workspace" title="Fill prescriptions" description="Enter the patient’s code or scan their QR code, then record the medicines you dispense." />
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setFound(null); setCredential(null); lookup.mutate({ code: code.trim() }); }}><div className="min-w-56 flex-1 space-y-2"><Label htmlFor="prescription-code">Prescription code</Label><Input id="prescription-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code shown by patient" required /></div><Button type="submit" disabled={lookup.isPending}><Search className="size-4" /> Find prescription</Button><Button type="button" variant="outline" onClick={() => setScanning(!scanning)}><Camera className="size-4" /> Scan QR</Button></form>{scanning && <QrScanner onScan={(token) => { setFound(null); setCredential(null); lookup.mutate({ qrToken: token }); }} onClose={() => setScanning(false)} />}{lookup.isError && <Feedback message={lookup.error.message} />}</div>
    {found && credential && <PrescriptionCard prescription={found}><DispenseForm key={found.id + JSON.stringify(credential)} prescription={found} credential={credential} onDone={() => { setFound(null); setCredential(null); setCode(''); void client.invalidateQueries({ queryKey: prescriptionKeys.pharmacyDispenses(userId) }); }} /></PrescriptionCard>}
    <section className="space-y-4"><h2 className="text-xl font-semibold">Your dispensing history</h2>{history.isPending ? <p className="text-sm text-slate-500">Loading history…</p> : history.isError ? <Feedback message={history.error.message} /> : history.data.length === 0 ? <EmptyState title="No medicines dispensed yet" description="Completed prescription fills will appear here." /> : history.data.map((dispense) => <div key={dispense.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><strong>Dispensed <DateText value={dispense.dispensedAt} /></strong><p className="text-sm text-slate-500">{dispense.items.length} medicine line{dispense.items.length === 1 ? '' : 's'} · {dispense.status}</p></div>{dispense.status === 'COMPLETED' && <Button type="button" size="sm" variant="outline" onClick={() => setReversing(dispense.id)}>Reverse fill</Button>}</div><ul className="text-sm text-slate-600">{dispense.items.map((item) => <li key={item.id}>{item.quantity} {item.unit} · {item.unitPrice} {item.currency}</li>)}</ul>{reversing === dispense.id && <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); reverse.mutate({ id: dispense.id, reason: reason.trim() }); }}><div className="min-w-56 flex-1 space-y-2"><Label htmlFor={`reason-${dispense.id}`}>Reason for reversal</Label><Input id={`reason-${dispense.id}`} value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} required /></div><Button type="submit" disabled={reverse.isPending || !reason.trim()}>Confirm reversal</Button><Button type="button" variant="outline" onClick={() => setReversing(null)}>Cancel</Button></form>}{reverse.isError && reversing === dispense.id && <Feedback message={reverse.error.message} />}</div>)}</section>
  </div>;
}

export function PharmacyPrescriptionsPage() { return <WorkspacePage role="PHARMACY" page="Prescriptions">{(user) => <PharmacyPrescriptionContent userId={user.id} />}</WorkspacePage>; }
