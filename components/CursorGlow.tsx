'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    let mouseX = 0;
    let mouseY = 0;

    const updatePosition = () => {
      glow.style.transform = `translate(${mouseX - 25}px, ${mouseY - 25}px)`;
      requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleClick = () => {
      glow.style.width = '100px';
      glow.style.height = '100px';
      setTimeout(() => {
        glow.style.width = '50px';
        glow.style.height = '50px';
      }, 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[50px] w-[50px] rounded-full"
      style={{
        background: 'radial-gradient(circle, radial-gradient(circle, rgb(58,140,91) 0%, rgb(58,140,91) 40%, rgb(58,140,91) 70%, rgb(58,140,91) 100%), transparent)',
        backdropFilter: 'blur(0px)',
        mixBlendMode: 'difference',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    />
  );
}
