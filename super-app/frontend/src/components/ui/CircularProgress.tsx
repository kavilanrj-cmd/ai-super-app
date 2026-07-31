'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  animated?: boolean;
}

export function CircularProgress({
  value,
  size = 160,
  strokeWidth = 10,
  color = 'url(#circleGradient)',
  label,
  sublabel,
  animated = true,
}: CircularProgressProps) {
  const [progress, setProgress] = useState(0);
  const clamped = Math.min(Math.max(value || 0, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!animated) {
      setProgress(clamped);
      return;
    }
    const timeout = setTimeout(() => setProgress(clamped), 100);
    return () => clearTimeout(timeout);
  }, [clamped, animated]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tracking-tight text-white" style={{ fontSize: size / 5 }}>
          {Math.round(progress)}
          {label && <span className="text-[0.5em] text-gray-400 ml-0.5">{label}</span>}
        </span>
        {sublabel && <span className="text-xs text-gray-500 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
