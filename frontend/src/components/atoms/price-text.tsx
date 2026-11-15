export function PriceText({ price, currency }: { price: string; currency: string }) {
  return <span className="font-semibold tabular-nums">{price} <span className="text-xs font-medium text-slate-500">{currency}</span></span>;
}
