import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KDP Intelligence — Self-Publishing Operating System',
  description:
    'Professional Amazon KDP Market Intelligence, Deep Market Scanner, Niche Finder, Book Studio & Publishing Operating System.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
