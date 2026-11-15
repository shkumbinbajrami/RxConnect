export function DateText({ value }: { value: string | null }) {
  if (!value) return <>—</>;
  const date = new Date(value);
  return <>{Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date)}</>;
}
