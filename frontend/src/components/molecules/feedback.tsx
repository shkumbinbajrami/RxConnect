export function Feedback({ message, tone = 'error' }: { message: string; tone?: 'error' | 'success' }) {
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>;
}
