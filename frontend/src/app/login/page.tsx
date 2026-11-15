'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [message, setMessage] = useState('');
  const [invited, setInvited] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setInvited(Boolean(data.session && window.location.hash)));
  }, []);
  async function setPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password'));
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error?.message ?? 'Password set. You can now log in.');
    if (!error) { await supabase.auth.signOut(); setInvited(false); window.history.replaceState(null, '', '/login'); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) });
    if (error || !data.session) { setMessage(error?.message ?? 'Login failed'); return; }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers: { Authorization: `Bearer ${data.session.access_token}` } });
    if (!response.ok) { await supabase.auth.signOut(); setMessage('Account is not verified or available'); return; }
    const user = await response.json();
    setMessage(`Logged in as ${user.role}`);
  }
  if (invited) return <main className="mx-auto mt-20 max-w-sm space-y-6 p-6"><h1 className="text-3xl font-semibold">Set your password</h1><form onSubmit={setPassword} className="space-y-4"><input className="w-full rounded border p-3" name="password" type="password" minLength={8} required placeholder="New password" /><button className="rounded bg-emerald-700 px-5 py-3 text-white">Save password</button></form><p role="status">{message}</p></main>;
  return <main className="mx-auto mt-20 max-w-sm space-y-6 p-6"><h1 className="text-3xl font-semibold">Log in</h1><form onSubmit={submit} className="space-y-4">
    <input className="w-full rounded border p-3" name="email" type="email" placeholder="Email" required />
    <input className="w-full rounded border p-3" name="password" type="password" placeholder="Password" required />
    <button className="rounded bg-emerald-700 px-5 py-3 text-white">Log in</button>
  </form><p role="status">{message}</p><Link href="/register">Create account</Link></main>;
}
