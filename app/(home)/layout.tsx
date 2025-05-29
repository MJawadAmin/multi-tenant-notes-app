// app/(home)/layout.tsx
'use client';
import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}
