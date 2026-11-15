import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'RxConnect — a clearer path from prescription to care';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 76, color: 'white', backgroundColor: '#102b27', backgroundImage: 'radial-gradient(circle at 95% 5%, #1c6650 0, transparent 42%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, fontWeight: 700 }}>
        <div style={{ width: 56, height: 56, borderRadius: 15, backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 400, lineHeight: 1 }}>+</div>
        RxConnect<span style={{ color: '#6ee7b7', marginLeft: -16 }}>.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
        <div style={{ color: '#6ee7b7', fontSize: 22, fontWeight: 700, letterSpacing: 5 }}>CARE, CONNECTED</div>
        <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.08, letterSpacing: -3, maxWidth: 980 }}>A clearer path from prescription to care.</div>
      </div>
      <div style={{ color: '#d1fae5', fontSize: 25 }}>For patients, doctors, and pharmacies.</div>
    </div>,
    size,
  );
}
