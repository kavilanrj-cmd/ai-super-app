'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  children?: ReactNode | ((activeTab: string) => ReactNode);
  className?: string;
  pill?: boolean;
}

export function Tabs({ tabs, activeTab: controlledTab, onChange, children, className, pill = false }: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const activeTab = controlledTab ?? internalTab;

  const handleChange = (tabId: string) => {
    setInternalTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm overflow-x-auto no-scrollbar',
          className
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={cn(
                  'absolute inset-0 border rounded-lg',
                  pill
                    ? 'bg-gradient-to-r from-primary-500/25 to-violet-500/25 border-primary-500/40 shadow-glow-sm'
                    : 'bg-primary-500/15 border-primary-500/30'
                )}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {typeof children === 'function' ? (children as (tab: string) => ReactNode)(activeTab) : children}
    </div>
  );
}
