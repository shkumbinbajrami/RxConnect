'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { currentUserKey } from '@/features/auth/api';
import type { CurrentUser, Profile } from '@/features/auth/types';
import type { Role } from '@/lib/roles';
import { updateProfile } from '../api';

const fields: Record<Exclude<Role, 'ADMIN'>, { name: string; label: string; type?: string; autoComplete?: string }[]> = {
  DOCTOR: [
    { name: 'fullName', label: 'Full name', autoComplete: 'name' },
    { name: 'specialty', label: 'Specialty' },
    { name: 'licenseNumber', label: 'License number' },
    { name: 'workplace', label: 'Workplace' },
  ],
  FARMACY: [
    { name: 'pharmacyName', label: 'Pharmacy name' },
    { name: 'licenseNumber', label: 'License number' },
    { name: 'address', label: 'Address', autoComplete: 'street-address' },
    { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  ],
  PATIENT: [
    { name: 'fullName', label: 'Full name', autoComplete: 'name' },
    { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
    { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  ],
};

export function ProfileForm({ role, profile, onSaved, onCancel }: {
  role: Exclude<Role, 'ADMIN'>;
  profile: Profile | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(currentUserKey, user);
      onSaved();
    },
  });

  return <form className="space-y-6" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate(Object.fromEntries(fields[role].map(({ name }) => [name, String(data.get(name) ?? '')])));
  }}>
    <div className="grid gap-5 sm:grid-cols-2">{fields[role].map(({ name, label, type, autoComplete }) => <FormField key={name} name={name} label={label} type={type ?? 'text'} autoComplete={autoComplete} defaultValue={name === 'dateOfBirth' ? profile?.[name]?.slice(0, 10) ?? '' : profile?.[name] ?? ''} maxLength={name === 'address' ? 240 : name === 'phone' ? 40 : name === 'licenseNumber' ? 80 : name === 'workplace' || name === 'pharmacyName' ? 160 : 120} />)}</div>
    {mutation.isError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{mutation.error.message}</p>}
    <div className="flex flex-wrap gap-3"><Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="size-4 animate-spin" />} Save profile</Button><Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button></div>
  </form>;
}
