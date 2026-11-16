'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

export function ConfirmAction({ open, title, description, actionLabel, cancelLabel = 'Keep visit', destructive = false, pending, onConfirm, onClose }: {
  open: boolean; title: string; description: string; actionLabel: string; cancelLabel?: string; destructive?: boolean;
  pending: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return <Drawer open={open} onOpenChange={(value) => { if (!value && !pending) onClose(); }}>
    <DrawerContent className="mx-auto max-w-lg">
      <DrawerHeader><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription></DrawerHeader>
      <DrawerFooter className="flex-row justify-end gap-2"><Button type="button" variant="outline" disabled={pending} onClick={onClose}>{cancelLabel}</Button><Button type="button" variant={destructive ? 'destructive' : 'default'} disabled={pending} onClick={onConfirm}>{pending ? 'Working…' : actionLabel}</Button></DrawerFooter>
    </DrawerContent>
  </Drawer>;
}
