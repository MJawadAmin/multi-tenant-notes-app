// app/(home)/layout.tsx
'use client';
import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {children}
      </main>
    </>
  );
}
