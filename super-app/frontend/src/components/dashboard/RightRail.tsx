'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, User, FileUp, MessageSquare, FileText, CalendarDays, MessagesSquare, TrendingUp, ArrowRight, Flame } from 'lucide-react';
import { CircularProgress } from '@/components/ui';
import { cn } from '@/lib/utils';

function SparklesFieldBasic() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: `${8 + ((i * 13) % 84)}%`,
              top: `${10 + ((i * 29) % 70)}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              animationDelay: `${(i % 5)}s`,
              '--dur': `${6 + (i % 4)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function ProgressCard({
  items,
}: {
  items: { label: string; done: boolean }[];
}) {
  const done = items.filter((i) => i.done).length;
  const total = items.length || 1;
  const pct = Math.round((done / total) * 100);
  const icons = [User, FileUp, MessageSquare, FileText];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass-card dash-widget flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h3 className="widget-title font-bold tracking-tight text-[var(--text-primary)]">Your Progress</h3>
        <span className="badge-shimmer text-[clamp(8px,1vh,11px)] font-semibold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/25">
          {pct}%
        </span>
      </div>

      <div className="flex items-center gap-3 flex-1 min-h-0 mt-1.5">
        <div className="shrink-0 progress-ring-glow">
          <CircularProgress value={pct} size={110} strokeWidth={13} label="%" sublabel="Ready" />
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 gap-[clamp(3px,0.4vh,6px)]">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2 py-[clamp(2px,0.5vh,5px)] transition-colors min-w-0',
                item.done
                  ? 'border-emerald-500/25 bg-emerald-500/[0.07]'
                  : 'border-white/[0.07] bg-white/[0.03]'
              )}
            >
              <span
                className={cn(
                  'w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 transition-all',
                  item.done
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-glow-sm'
                    : 'bg-white/[0.05] border border-white/10 text-[var(--muted)]'
                )}
              >
                {item.done ? <Check className="w-3 h-3" /> : <i className="not-italic text-[8px] font-bold">{i + 1}</i>}
              </span>
              <span className={cn('flex-1 text-[clamp(8px,1vh,11px)] font-medium truncate', item.done ? 'text-emerald-200/80 line-through decoration-emerald-500/40' : 'text-[var(--text-secondary)]')}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function WeeklyActivity({ activeDays, messages }: { activeDays: number; messages: number }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seeded = Array.from({ length: 7 }, (_, i) => {
    const base = activeDays <= 0 ? 0 : Math.max(0, 12 + ((i * 17 + (activeDays % 5) * 3) % 28) - 6);
    return base;
  });
  const hasData = activeDays > 0 || messages > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.56, duration: 0.4 }}
      className="glass-card dash-widget flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h3 className="widget-title font-bold tracking-tight text-[var(--text-primary)]">This Week</h3>
        <span className="inline-flex items-center gap-1 text-[clamp(7.5px,0.95vh,10.5px)] text-[var(--muted)]">
          <Flame className="w-3 h-3 text-orange-400" /> {activeDays} days
        </span>
      </div>

      {hasData ? (
        <>
          <div className="flex items-end gap-[clamp(3px,0.4vw,6px)] flex-1 min-h-[clamp(30px,4.6vh,48px)] mt-1.5" role="img" aria-label="Weekly activity chart">
            {seeded.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-[2px] h-full">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  className="week-bar w-full rounded-md bg-gradient-to-t from-primary-600/40 via-violet-500/50 to-blue-500/60 hover:from-primary-500 hover:to-blue-400 transition-all duration-300 cursor-pointer origin-bottom will-change-transform"
                  style={{ height: `${Math.max(10, h)}%` }}
                />
                <span className="text-[clamp(6px,0.75vh,9px)] text-[var(--muted)] leading-none">{days[i].charAt(0)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/[0.06] text-[clamp(8px,1vh,10.5px)] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <MessagesSquare className="w-3 h-3" /> {messages} messages
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> {activeDays} active
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center flex-1 min-h-0">
          <CalendarDays className="w-6 h-6 text-[var(--muted)]" />
          <p className="text-[clamp(9px,1.1vh,12px)] font-medium text-[var(--text-secondary)] mt-1.5">No activity this week yet</p>
        </div>
      )}
    </motion.div>
  );
}

export function OpportunitiesCTA() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.62, duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl glass-card dash-widget hero-panel premium-border group flex flex-col"
    >
      <SparklesFieldBasic />
      <div className="hero-shine" />
      <div className="relative z-10 flex flex-col flex-1 min-h-0 justify-center">
<span className="inline-flex items-center gap-1.5 text-[clamp(7.5px,0.95vh,10.5px)] font-semibold px-2.5 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 w-fit">
            <TrendingUp className="w-3 h-3" /> Bigger opportunities ahead
          </span>
        <p className="widget-title font-bold tracking-tight text-[var(--text-primary)] leading-snug mt-1.5">
          Your AI journey starts now.
        </p>
        <button
          onClick={() => router.push('/jobs')}
          className="group/btn inline-flex items-center gap-1.5 text-[clamp(9px,1.1vh,12px)] font-semibold text-primary-200 hover:text-white transition-colors mt-1.5 w-fit"
        >
          Explore Jobs
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}

export { SparklesFieldBasic };