import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#E60012',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Workshop & Daisha Maintenance | PT Bridgestone Tire Indonesia';
  const shortTitle = 'Daisha Workshop';

  return {
    title,
    description:
      'Sistem Pencatatan, Monitoring, dan Rekapitulasi Perbaikan Daisha Internal PT Bridgestone',
    manifest: '/manifest.json',
    applicationName: title,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: shortTitle,
    },
    icons: {
      icon: [
        { url: '/favicon.ico?v=2' },
        { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
      ],
    },
    other: {
      'strix-verification': 'strix-verify-7317054cf78dcaca50761d210d1fa8e6',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="strix-verification" content="strix-verify-7317054cf78dcaca50761d210d1fa8e6" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${sansFont.variable} ${monoFont.variable} font-sans antialiased text-slate-900 bg-slate-50 min-h-screen`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}