import Link from 'next/link';
import { BrandMark } from '@/components/atoms/brand-mark';

export function AuthShell({ eyebrow, title, description, children, footer }: {
  eyebrow: string; title: string; description: string; children: React.ReactNode; footer: React.ReactNode;
}) {
  return <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.88fr)]">
    <section className="relative hidden flex-col justify-between overflow-hidden bg-[#102b27] p-12 text-white lg:flex xl:p-16">
      <div className="absolute -right-40 -top-40 size-[560px] rounded-full border border-white/10" />
      <div className="absolute -right-20 -top-20 size-[400px] rounded-full border border-white/10" />
      <div className="absolute -bottom-52 left-0 size-[560px] rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="relative [&>div]:text-white [&>div>span:last-child]:text-white"><BrandMark /></div>
      <div className="relative max-w-xl">
        <span className="mb-7 inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Care, connected</span>
        <h2 className="text-5xl font-semibold leading-[1.1] tracking-tight xl:text-6xl">A clearer path from prescription to care.</h2>
        <p className="mt-6 max-w-md text-lg leading-8 text-emerald-50/75">One secure workspace for patients, doctors, and pharmacies to stay connected.</p>
      </div>
      <p className="relative text-sm text-emerald-100/50">RxConnect · Built for trusted care</p>
    </section>
    <section className="flex min-h-screen flex-col bg-[#f7faf8] px-6 py-7 sm:px-10 lg:px-14">
      <div className="flex items-center justify-between lg:justify-end">
        <div className="lg:hidden"><BrandMark /></div>
        <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-emerald-700">Back to home</Link>
      </div>
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-9">{children}</div>
        <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>
      </div>
      <p className="text-center text-xs text-slate-400">Secure access to your care workspace.</p>
    </section>
  </main>;
}
