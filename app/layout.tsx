// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import CursorGlow from '@/components/CursorGlow';
import ScrollResetter from '@/components/ScrollResetter'; // ✅ Import this
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Multi-Tenant Notes App',
  description: 'Collaborative, secure notes for your entire organization..',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-800 scroll-smooth overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <ScrollResetter /> {/* ✅ Add this to fix scroll issues */}
        <CursorGlow />
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
