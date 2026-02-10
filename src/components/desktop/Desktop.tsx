'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import the real desktop with no SSR to kill hydration errors for good
const SovereignDesktop = dynamic(
  () => import('./SovereignDesktop'),
  { ssr: false }
);

export const Desktop = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return <SovereignDesktop />;
};