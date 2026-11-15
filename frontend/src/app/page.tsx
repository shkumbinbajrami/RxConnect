import Link from 'next/link';

export default function Home() {
  const roles = ["Doctors", "Patients", "Pharmacies"];

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          RxConnect
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Prescriptions connected to better care.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          A secure place for doctors, patients, and pharmacies to manage trusted
          prescriptions together.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
          <Link href="/register" className="rounded-full bg-emerald-700 px-4 py-2 text-white">Register</Link>
          <Link href="/login" className="rounded-full bg-slate-900 px-4 py-2 text-white">Log in</Link>
          {roles.map((role) => (
            <span key={role} className="rounded-full bg-emerald-50 px-4 py-2">
              {role}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
