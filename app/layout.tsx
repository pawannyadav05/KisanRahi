import './globals.css';
import type { Metadata } from 'next';
import { GovHeader } from '@/components/shared/GovHeader';

export const metadata: Metadata = {
  title: 'KisanRahi — Direct Farm-to-Buyer PWA',
  description: 'Voice-to-Market Produce Pooling and Direct Logistics Platform for Farmers',
  manifest: '/manifest.json',
  themeColor: '#0b2545',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas">
        <GovHeader />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
