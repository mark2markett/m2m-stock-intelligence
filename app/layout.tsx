import type { Metadata, Viewport } from 'next';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://singlestock.mark2markets.com'),
  title: 'M2M Stock Intelligence | Educational Market Analysis',
  description: 'Educational stock analysis platform with AI-powered technical indicators, pattern recognition, and observational market insights by Mark2Market.',
  keywords: ['stock analysis', 'technical indicators', 'market education', 'Mark2Market', 'M2M'],
  authors: [{ name: 'Mark2Market' }],
  openGraph: {
    title: 'M2M Stock Intelligence',
    description: 'Educational stock analysis with AI-powered technical indicators and market observations.',
    type: 'website',
    siteName: 'M2M Stock Intelligence',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M2M Stock Intelligence',
    description: 'Educational stock analysis with AI-powered technical indicators and market observations.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e17] text-[#E5E7EB] antialiased">
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </body>
    </html>
  );
}
