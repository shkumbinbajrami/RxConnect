import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RxConnect | Care, connected',
    template: '%s | RxConnect',
  },
  description: 'A clearer path from prescription to care. One secure workspace for patients, doctors, and pharmacies.',
  applicationName: 'RxConnect',
  openGraph: {
    type: 'website',
    siteName: 'RxConnect',
    title: 'RxConnect | Care, connected',
    description: 'A clearer path from prescription to care. One secure workspace for patients, doctors, and pharmacies.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'RxConnect — a clearer path from prescription to care' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RxConnect | Care, connected',
    description: 'A clearer path from prescription to care. One secure workspace for patients, doctors, and pharmacies.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
