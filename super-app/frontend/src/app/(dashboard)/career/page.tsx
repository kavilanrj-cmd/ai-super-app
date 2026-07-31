'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '@/lib/api';
import {
  Route, MessageSquareText, DollarSign, Code, Sparkles, Target, Check, Copy, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

type Mode = 'roadmap' | 'interview' | 'salary' | 'challenges';

const modes = [
  { id: 'roadmap' as Mode, icon: Route, label: 'Roadmap', desc: 'Career path planning', gradient: 'from-violet-500 to-fuchsia-500' },
  { id: 'interview' as Mode, icon: MessageSquareText, label: 'Interview', desc: 'Practice questions', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'salary' as Mode, icon: DollarSign, label: 'Salary', desc: 'Salary prediction', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'challenges' as Mode, icon: Code, label: 'Challenges', desc: 'Coding challenges', gradient: 'from-amber-500 to-orange-500' },
];

const formTitles: Record<Mode, string> = {
  roadmap: 'Generate Career Roadmap',
  interview: 'Generate Interview Questions',
  salary: 'Predict Salary',
  challenges: 'Generate Coding Challenges',
};

export default function CareerPage() {
  const [mode, setMode] = useState<Mode>('roadmap');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      let res;

      switch (mode) {
        case 'roadmap': {
          const current = formData.get('current_role') as string;
          const target = formData.get('target_role') as string;
          res = await aiAPI.roadmap(current, target);
          break;
        }
        case 'interview': {
          const role = formData.get('role') as string;
          const company = formData.get('company') as string;
          res = await aiAPI.interview(role, company || undefined);
          break;
        }
        case 'salary': {
          const role2 = formData.get('role') as string;
          const exp = parseInt(formData.get('experience') as string);
          const loc = formData.get('location') as string;
          const skills = formData.get('skills') as string;
          res = await aiAPI.salary(role2, exp, loc, skills);
          break;
        }
      }

      if (res) {
        setResult(res.data.roadmap || res.data.questions || res.data.salary_prediction || JSON.stringify(res.data));
      }
      toast.success('Generated!');
    } catch (err) {
      toast.error('Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const activeMode = modes.find((m) => m.id === mode) || modes[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<Target className="w-6 h-6 text-white" />}
        title="Career Assistant"
        subtitle="AI-powered career development tools"
        gradient="from-primary-500 to-fuchsia-500"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            onClick={() => setMode(m.id)}
            className={cn(
              'glass-card !rounded-xl p-3.5 text-left group transition-all',
              mode === m.id ? 'border-primary-500/40 bg-primary-500/[0.06]' : 'hover:border-white/15'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110', m.gradient)}>
              <m.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-200">{m.label}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradientBorder className="p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', activeMode.gradient)}>
                <activeMode.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">{formTitles[mode]}</h3>
                <p className="text-xs text-gray-500">{activeMode.desc}</p>
              </div>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              {mode === 'roadmap' && (
                <>
                  <Input name="current_role" label="Current Role" placeholder="e.g., Junior Developer" required />
                  <Input name="target_role" label="Target Role" placeholder="e.g., Senior Developer" required />
                </>
              )}
              {mode === 'interview' && (
                <>
                  <Input name="role" label="Job Role" placeholder="e.g., Frontend Engineer" required />
                  <Input name="company" label="Company (optional)" placeholder="e.g., Google" />
                </>
              )}
              {mode === 'salary' && (
                <>
                  <Input name="role" label="Job Role" placeholder="e.g., Data Scientist" required />
                  <Input name="experience" type="number" label="Years of Experience" placeholder="e.g., 5" required />
                  <Input name="location" label="Location" placeholder="e.g., New York" required />
                  <Input name="skills" label="Skills" placeholder="Comma separated, e.g., Python, SQL" required />
                </>
              )}
              {mode === 'challenges' && (
                <>
                  <Input name="role" label="Role / Topic" placeholder="e.g., React" required />
                  <Input name="difficulty" label="Difficulty" placeholder="easy / medium / hard" />
                </>
              )}
              <Button type="submit" variant="gradient" className="w-full" loading={loading}>
                <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate'}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {result ? (
            <Card className="p-6 sm:p-7 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <CardTitle className="text-base">{activeMode.label} Result</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={copyResult}>
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                  {result}
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-5"
              >
                <Loader2 className="w-7 h-7 text-primary-400" />
              </motion.div>
              <p className="font-medium text-gray-200">Generating your {activeMode.label.toLowerCase()}...</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs">The AI is crafting a tailored result for you.</p>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col justify-center min-h-[420px]">
              <EmptyState
                icon={<Sparkles className="w-6 h-6 text-primary-400" />}
                title="Your result will appear here"
                description="Fill in the details and generate an AI-powered career result."
                className="!py-0"
              />
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
