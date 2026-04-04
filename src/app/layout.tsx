import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raisy — Raise your hand.',
  description: 'Real-time polls. No sign-up. Share a link, get instant answers.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Raisy — Raise your hand.',
    description: 'Real-time polls. No sign-up. Share a link, get instant answers.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
