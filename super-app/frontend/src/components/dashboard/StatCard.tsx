'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui';

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  glow: string;
  accentText: string;
  index?: number;
  suffix?: string;
}

function buildSpark(value: number) {
  const pts: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const base = 24 + (value % 37);
    const wave = Math.sin(i * 1.35 + value % 7) * 14;
    const noise = ((i * 7 + value) % 9) * 1.4;
    const y = Math.max(4, Math.min(36, base + wave + noise));
    pts.push(`${(i / (n - 1)) * 100},${y.toFixed(1)}`);
  }
  return pts;
}

export default function StatCard({ label, value, icon: Icon, gradient, glow, accentText, index = 0, suffix }: StatCardProps) {
  const points = useMemo(() => buildSpark(value), [value]);
  const path = `M ${points.join(' L ')}`;
  const areaPath = `${path} L 100,40 L 0,40 Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.08, duration: 0.5 }}
      className="stat-card stat-card-compact premium-hover"
      style={{ '--glow': glow, '--sheen-delay': `${1.2 + index * 0.55}s` } as React.CSSProperties}
    >
      <span className="stat-sheen" />
      <span className={cn('stat-icon bg-gradient-to-br', gradient)} style={{ animationDelay: `${index * 0.7}s` }}>
        <Icon className="text-white" />
      </span>

      <div className="flex-1 min-w-0">
        <p className="stat-number font-extrabold tracking-tight text-[var(--text-primary)]">
          <AnimatedNumber value={value} format={(n) => (suffix ? `${n.toLocaleString()}${suffix}` : n.toLocaleString())} />
        </p>
        <p className="stat-label text-[var(--text-secondary)] font-medium truncate">{label}</p>
      </div>

      <div className="stat-spark overflow-hidden opacity-80">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`spark-fill-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={glow} stopOpacity="0.35" />
              <stop offset="100%" stopColor={glow} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#spark-fill-${label.replace(/\s+/g, '')})`} />
          <path
            d={path}
            fill="none"
            stroke={glow}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-path"
          />
        </svg>
      </div>
    </motion.div>
  );
}