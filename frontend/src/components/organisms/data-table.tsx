import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';

export function DataTable({ headers, children, empty }: { headers: string[]; children: ReactNode; empty?: ReactNode }) {
  if (!children) return <>{empty}</>;
  const rows = Children.map(children, (row) => {
    if (!isValidElement(row)) return row;
    const element = row as ReactElement<{ children?: ReactNode }>;
    const cells = Children.map(element.props.children, (cell, index) => isValidElement(cell)
      ? cloneElement(cell as ReactElement<{ 'data-label'?: string }>, { 'data-label': headers[index] }) : cell);
    return cloneElement(element, {}, cells);
  });
  return <div className="data-table overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="w-full min-w-[680px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr>{headers.map((header) => <th key={header} scope="col" className="border-b border-slate-200 px-4 py-3 last:text-right">{header}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100 text-slate-700">{rows}</tbody>
    </table>
  </div>;
}

export function TableActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 whitespace-nowrap">{children}</div>;
}
