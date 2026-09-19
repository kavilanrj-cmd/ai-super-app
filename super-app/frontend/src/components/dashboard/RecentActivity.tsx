'use client';

import { useReducer } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, FileSearch, ListTodo, Activity, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  type: 'chat' | 'document' | 'resume' | 'task';
  title: string;
  at?: string;
}

const META: Record<ActivityItem['type'], { icon: any; chip: string; text: string }> = {
  chat: { icon: MessageSquare, chip: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-300' },
  document: { icon: FileText, chip: 'bg-pink-500/20 border-pink-500/30', text: 'text-pink-300' },
  resume: { icon: FileSearch, chip: 'bg-violet-500/20 border-violet-500/30', text: 'text-violet-300' },
  task: { icon: ListTodo, chip: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-300' },
};

export function timeAgo(input?: string) {
  if (!input) return 'just now';
  const t = Date.parse(input);
  if (Number.isNaN(t)) return 'just now';
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString();
}

export default function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  const [, force] = useReducer((x: number) => x + 1, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="glass-card dash-widget flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h3 className="widget-title font-bold tracking-tight text-[var(--text-primary)]">Recent Activity</h3>
        <Activity className="w-3.5 h-3.5 text-primary-300" />
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center flex-1 min-h-0">
          <span className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[var(--muted)]" />
          </span>
          <p className="text-[clamp(9px,1.1vh,12px)] font-medium text-[var(--text-secondary)] mt-1.5">No activity yet</p>
          <p className="text-[clamp(8px,0.95vh,10.5px)] text-[var(--muted)] mt-0.5">Your recent actions will show here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[clamp(3px,0.5vh,6px)] flex-1 min-h-0 justify-center mt-1.5">
          {activities.map((item, i) => {
            const meta = META[item.type] || META.chat;
            return (
              <motion.button
                key={`${item.type}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62 + i * 0.05 }}
                onClick={force}
                className="group premium-hover w-full flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-[clamp(2px,0.5vh,5px)] text-left transition-all duration-300 hover:border-primary-400/30 hover:bg-white/[0.05] hover:-translate-y-0.5 min-w-0"
              >
                <span className={cn('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', meta.chip)}>
                  <meta.icon className={cn('w-3.5 h-3.5', meta.text)} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[clamp(8.5px,1.05vh,11.5px)] font-semibold text-[var(--text-primary)] truncate">{item.title}</span>
                  <span className="block text-[clamp(7.5px,0.9vh,10px)] text-[var(--muted)] leading-none">{timeAgo(item.at)}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary-300 transition-all duration-300 shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}