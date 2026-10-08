'use client';

import dynamic from 'next/dynamic';

const HeroScene3D = dynamic(() => import('./HeroScene3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-primary-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl animate-pulse" />
    </div>
  ),
});

export default function HeroCanvasLoader() {
  return <HeroScene3D />;
}
