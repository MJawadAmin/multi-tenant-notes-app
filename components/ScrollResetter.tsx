'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollResetter() {
  const pathname = usePathname();

  useEffect(() => {
    // Fix lingering scroll issues after route changes
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
