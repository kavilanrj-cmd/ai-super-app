import { Sparkles } from 'lucide-react';

export default function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="dash-footer">
        <span className="inline-flex items-center font-bold text-[var(--text-primary)]">
          <Sparkles className="w-3 h-3 text-primary-300 mr-1" />
          AI Super App
        </span>
        <span className="dash-footer-dots">•</span>
        <span className="inline-flex items-center">
          Build <span className="dash-footer-dots">•</span> Learn <span className="dash-footer-dots">•</span> Create{' '}
          <span className="dash-footer-dots">•</span> Grow <span className="dash-footer-dots">•</span> Together
        </span>
      </footer>
    );
  }

  return (
    <footer className="mt-12 pt-6 pb-6 border-t border-white/[0.06] text-center">
      <p className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--text-primary)]">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
        AI Super App
      </p>
      <p className="text-[12px] text-[var(--muted)] mt-2">
        Build <span className="mx-1 text-white/20">•</span> Learn <span className="mx-1 text-white/20">•</span> Create{' '}
        <span className="mx-1 text-white/20">•</span> Grow <span className="mx-1 text-white/20">•</span> Together
      </p>
    </footer>
  );
}