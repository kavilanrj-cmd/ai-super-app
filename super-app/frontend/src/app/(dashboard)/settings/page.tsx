'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Bell, Cpu, Moon, Globe, Type, BellRing, Mail,
  Volume2, Radio, Database, Shield, Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, Tabs, Select, Button, Badge } from '@/components/ui';

type SettingItem =
  | { label: string; type: 'toggle'; icon: LucideIcon; value: boolean }
  | { label: string; type: 'select'; icon: LucideIcon; value: string };

interface SettingSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
}

const settingsSections: SettingSection[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    items: [
      { label: 'Dark Mode', type: 'toggle', icon: Moon, value: true },
      { label: 'Language', type: 'select', icon: Globe, value: 'English (US)' },
      { label: 'Font Size', type: 'select', icon: Type, value: 'Medium' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Push Notifications', type: 'toggle', icon: BellRing, value: true },
      { label: 'Email Notifications', type: 'toggle', icon: Mail, value: true },
      { label: 'Sound Effects', type: 'toggle', icon: Volume2, value: false },
    ],
  },
  {
    id: 'ai',
    title: 'AI Preferences',
    icon: Cpu,
    items: [
      { label: 'Default AI Model', type: 'select', icon: Cpu, value: 'Groq (LLaMA 70B)' },
      { label: 'Stream Responses', type: 'toggle', icon: Radio, value: true },
      { label: 'Save Chat History', type: 'toggle', icon: Database, value: true },
    ],
  },
];

const selectOptions: Record<string, { value: string; label: string }[]> = {
  Language: [
    { value: 'English (US)', label: 'English (US)' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Japanese', label: 'Japanese' },
  ],
  'Font Size': [
    { value: 'Small', label: 'Small' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Large', label: 'Large' },
  ],
  'Default AI Model': [
    { value: 'Groq (LLaMA 70B)', label: 'Groq (LLaMA 70B)' },
    { value: 'GPT-4o', label: 'GPT-4o' },
    { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'Gemini 1.5 Pro', label: 'Gemini 1.5 Pro' },
  ],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(settingsSections);

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...settings];
    const item = updated[sectionIdx].items[itemIdx];
    if (item.type === 'toggle') {
      item.value = !item.value;
      setSettings(updated);
      toast.success(`${item.label} updated`);
    }
  };

  const updateItem = (sectionIdx: number, itemIdx: number, value: string) => {
    const updated = [...settings];
    const item = updated[sectionIdx].items[itemIdx];
    if (item.type === 'select') {
      item.value = value;
      setSettings(updated);
      toast.success(`${item.label} updated`);
    }
  };

  const tabs = [
    ...settingsSections.map((s) => ({
      id: s.id,
      label: s.title,
      icon: <s.icon className="w-4 h-4" />,
    })),
    { id: 'data', label: 'Data & Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <PageHeader
        icon={<Settings className="w-6 h-6 text-white" />}
        title="Settings"
        subtitle="Customize your workspace — preferences are saved on your device"
        actions={<Badge variant="success" dot>All saved</Badge>}
      />

      <Tabs tabs={tabs} pill>
        {(activeTab) => {
          if (activeTab === 'data') {
            return (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card p-6 sm:p-8 space-y-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/15 to-orange-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                      <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">Data & Privacy</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-md">
                        Take full control of your data and account. Exports are prepared instantly and delivered to your email.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="secondary" className="justify-center py-3">
                      <Download className="w-4 h-4" /> Export Data
                    </Button>
                    <Button variant="danger" className="justify-center py-3">
                      <Shield className="w-4 h-4" /> Delete Account
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          }

          const sIdx = settingsSections.findIndex((s) => s.id === activeTab);
          const section = settings[sIdx];

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="glass-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{section.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {section.items.length} {section.items.length === 1 ? 'preference' : 'preferences'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {section.items.map((item, iIdx) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-200">{item.label}</span>
                      </div>

                      {item.type === 'toggle' && (
                        <button
                          role="switch"
                          aria-checked={item.value}
                          onClick={() => toggleItem(sIdx, iIdx)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                            item.value ? 'bg-gradient-to-r from-primary-500 to-violet-500 shadow-glow-sm' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                              item.value ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}

                      {item.type === 'select' && (
                        <Select
                          value={item.value}
                          onChange={(e) => updateItem(sIdx, iIdx, e.target.value)}
                          options={selectOptions[item.label] || [{ value: item.value, label: item.value }]}
                          className="w-full sm:w-56 text-sm"
                          aria-label={item.label}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        }}
      </Tabs>
    </div>
  );
}
