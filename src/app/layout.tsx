import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'VYRAL — AI YouTube Intelligence & Operating System',
  description:
    'AI-Powered YouTube Intelligence, Competitor Research, Outlier Discovery, Script Production & Channel Growth Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
