import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import { getServerInfo } from '@/lib/serverInfo';

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { formattedTitle, ip, port } = getServerInfo();
  const shortTitle = ip !== 'localhost' ? `Daisha [${ip}:${port}]` : 'Daisha Mnt';

  return {
    title: formattedTitle,
    description:
      'Sistem Pencatatan, Monitoring, dan Rekapitulasi Perbaikan Daisha Internal PT Bridgestone',
    manifest: '/manifest.json',
    applicationName: formattedTitle,
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-100 font-sans antialiased text-gray-900 min-h-screen">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}