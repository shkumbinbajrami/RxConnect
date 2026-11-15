'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/molecules/feedback';

export function QrScanner({ onScan, onClose }: { onScan: (token: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const callback = useRef(onScan);
  const [error, setError] = useState('');
  useEffect(() => { callback.current = onScan; }, [onScan]);
  useEffect(() => {
    let stopped = false;
    let controls: IScannerControls | undefined;
    const reader = new BrowserQRCodeReader();
    if (video.current) void reader.decodeFromVideoDevice(undefined, video.current, (result, _error, scanner) => {
      if (result && !stopped) { stopped = true; scanner.stop(); callback.current(result.getText()); }
    }).then((scanner) => { controls = scanner; if (stopped) scanner.stop(); }).catch((cause: unknown) => { if (!stopped) setError(cause instanceof Error ? cause.message : 'Could not start camera.'); });
    return () => { stopped = true; controls?.stop(); };
  }, []);
  return <div className="space-y-3 rounded-xl border border-emerald-200 bg-white p-4"><p className="font-medium">Scan the patient’s QR code</p><video ref={video} className="aspect-video w-full max-w-md rounded-lg bg-slate-900 object-cover" muted playsInline />{error && <Feedback message={error} />}<Button type="button" variant="outline" onClick={onClose}>Close camera</Button></div>;
}
