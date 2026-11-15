import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = React.ComponentProps<typeof Input> & { label: string; hint?: string };

export function FormField({ label, hint, id, name, ...props }: Props) {
  const fieldId = id ?? name;
  return <div className="space-y-2">
    <Label htmlFor={fieldId}>{label}</Label>
    <Input id={fieldId} name={name} className="h-11 bg-white px-3" {...props} />
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>;
}
