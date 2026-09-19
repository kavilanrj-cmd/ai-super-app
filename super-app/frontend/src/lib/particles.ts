export interface ParticleSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_PARTICLES_COUNT = 40;
export const DEFAULT_BG_PARTICLES_COUNT = 18;
export const DEFAULT_SPARKLES_COUNT = 14;

export function makeParticles(count: number, seed = 1234567): ParticleSpec[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: rand() * 3.5 + 1,
    duration: rand() * 8 + 5,
    delay: rand() * 6,
    opacity: rand() * 0.35 + 0.08,
  }));
}

export const PARTICLES = makeParticles(DEFAULT_PARTICLES_COUNT);
export const BG_PARTICLES = makeParticles(DEFAULT_BG_PARTICLES_COUNT);
export const SPARKLES = makeParticles(DEFAULT_SPARKLES_COUNT);