'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

export default function Register() {
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    setMessage(response.ok ? 'Account created. You can log in.' : data.message?.toString() ?? 'Registration failed');
  }
  return <main className="mx-auto mt-20 max-w-sm space-y-6 p-6"><h1 className="text-3xl font-semibold">Register</h1><form onSubmit={submit} className="space-y-4">
    <input className="w-full rounded border p-3" name="email" type="email" placeholder="Email" required />
    <input className="w-full rounded border p-3" name="password" type="password" placeholder="Password (8+ characters)" minLength={8} required />
    <select className="w-full rounded border p-3" name="role" required><option value="PATIENT">Patient</option><option value="DOCTOR">Doctor</option><option value="FARMACY">Farmacy</option></select>
    <button className="rounded bg-emerald-700 px-5 py-3 text-white">Create account</button>
  </form><p role="status">{message}</p><Link href="/login">Already registered? Log in</Link></main>;
}
