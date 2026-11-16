'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, LoaderCircle } from 'lucide-react';
import { Feedback } from '@/components/molecules/feedback';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/ui/button';
import { changePassword, requestPasswordReauthentication } from '../api';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [nonce, setNonce] = useState('');
  const [codeRequired, setCodeRequired] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const update = useMutation({ mutationFn: changePassword, onSuccess: () => { setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setNonce(''); setCodeRequired(false); setErrorMessage(''); setMessage('Your password has been changed.'); } });
  const pending = update.isPending || requestingCode;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (newPassword.length < 8) { setErrorMessage('Use at least 8 characters for the new password.'); return; }
    if (newPassword !== confirmation) { setErrorMessage('The new passwords do not match.'); return; }
    if (newPassword === currentPassword) { setErrorMessage('Choose a password different from your current password.'); return; }
    try {
      await update.mutateAsync({ currentPassword, newPassword, ...(codeRequired && { nonce: nonce.trim() }) });
    } catch (error) {
      if ((error as { code?: string }).code === 'reauthentication_needed' && !codeRequired) {
        setRequestingCode(true);
        try {
          await requestPasswordReauthentication();
          setCodeRequired(true);
          setMessage('We sent a security code to your account email. Enter it below to finish changing your password.');
        } catch (reauthError) {
          setErrorMessage(reauthError instanceof Error ? reauthError.message : 'Could not send the security code.');
        } finally {
          setRequestingCode(false);
        }
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Could not change your password.');
      }
    }
  }

  return <form className="space-y-4" onSubmit={(event) => void submit(event)}>
    <div className="flex items-start gap-2"><KeyRound className="mt-0.5 size-4 shrink-0 text-emerald-700" /><p className="text-sm text-slate-600">Use your current password to confirm this change.</p></div>
    <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
    <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required hint="At least 8 characters." />
    <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
    {codeRequired && <FormField label="Security code" name="securityCode" inputMode="numeric" autoComplete="one-time-code" value={nonce} onChange={(event) => setNonce(event.target.value)} required hint="Check your account email for the code." />}
    {errorMessage && <Feedback message={errorMessage} />}{message && <Feedback message={message} tone="success" />}
    <Button type="submit" disabled={pending || (codeRequired && !nonce.trim())} className="bg-emerald-700 hover:bg-emerald-800">{pending && <LoaderCircle className="size-4 animate-spin" />} Change password</Button>
  </form>;
}
