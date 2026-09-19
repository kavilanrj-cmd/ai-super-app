'use client';

import { useMemo } from 'react';
import { BG_PARTICLES, makeParticles } from '@/lib/particles';

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

interface AnimatedBackgroundProps {
  orbs?: boolean;
  grid?: boolean;
  particles?: boolean;
  count?: number;
}

export default function AnimatedBackground({
  orbs = true,
  grid = true,
  particles = true,
  count = 18,
}: AnimatedBackgroundProps) {
  const items = useMemo<Particle[]>(() => {
    const source = count === BG_PARTICLES.length ? BG_PARTICLES : makeParticles(count);
    return source.map((p) => ({
      id: p.id,
      left: p.x,
      top: p.y,
      size: p.size,
      duration: p.duration,
      delay: p.delay,
    }));
  }, [count]);

  return (
    <div className="app-bg" aria-hidden="true">
      {grid && <div className="app-bg-grid" />}
      {orbs && (
        <>
          <div className="bg-orb purple" style={{ width: 520, height: 520, top: '-12%', left: '-8%' }} />
          <div className="bg-orb pink" style={{ width: 460, height: 460, bottom: '-14%', right: '-6%' }} />
          <div className="bg-orb cyan" style={{ width: 380, height: 380, top: '24%', right: '12%' }} />
        </>
      )}
      {particles &&
        items.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                '--dur': `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}