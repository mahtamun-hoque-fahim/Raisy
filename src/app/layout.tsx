import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@/components/Analytics';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://raisy.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Raisy — Raise your hand.',
    template: '%s — Raisy',
  },
  description: 'Real-time polls. No sign-up. Share a link, watch votes roll in live.',
  keywords: ['poll', 'voting', 'real-time', 'anonymous', 'group decision', 'live results'],
  authors: [{ name: 'MAHTAMUN', url: 'https://mahtamunhoquefahim.pages.dev' }],
  creator: 'MAHTAMUN',
  openGraph: {
    title: 'Raisy — Raise your hand.',
    description: 'Real-time polls. No sign-up. Share a link, watch votes roll in live.',
    url: APP_URL,
    siteName: 'Raisy',
    type: 'website',
    images: [{
      url: `${APP_URL}/api/og?q=Raise+your+hand.`,
      width: 1200, height: 630,
      alt: 'Raisy — Real-time polls',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raisy — Raise your hand.',
    description: 'Real-time polls. No sign-up. Share a link, watch votes roll in live.',
    images: [`${APP_URL}/api/og?q=Raise+your+hand.`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>
      <body>{children}</body>
    </html>
  );
}
