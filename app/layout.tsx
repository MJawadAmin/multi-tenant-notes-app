import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import CursorGlow from '@/components/CursorGlow';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Multi-Tenant Notes App',
  description: 'Collaborative, secure notes for your entire organization.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative overflow-hidden bg-gray-50 text-gray-800 cursor-none`}>
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
