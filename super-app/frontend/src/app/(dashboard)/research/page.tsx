'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Search, Check, Copy, Sparkles, History, Lightbulb, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const depths = [
  { value: 'quick', label: 'Quick' },
  { value: 'medium', label: 'Medium' },
  { value: 'deep', label: 'Deep' },
  { value: 'comprehensive', label: 'Comprehensive' },
];

const tips = [
  'Be specific with your topic',
  'Use "Deep" for academic research',
  'Use "Quick" for fast answers',
  'Include context for better results',
];

export default function ResearchPage() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('medium');
  const [research, setResearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const conductResearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.research(topic, depth);
      setResearch(res.data.research);
      setHistory((prev) => [topic, ...prev.slice(0, 9)]);
      toast.success('Research completed');
    } catch { toast.error('Research failed'); }
    finally { setLoading(false); }
  };

  const copyResearch = async () => {
    await navigator.clipboard.writeText(research);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<Search className="w-6 h-6 text-white" />}
        title="AI Research Agent"
        subtitle="Deep research on any topic with comprehensive analysis"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card gradientBorder className="p-6 sm:p-7">
              <CardContent className="space-y-4">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Research Topic</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter research topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && conductResearch()}
                    className="flex-1"
                  />
                  <Select options={depths} value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full sm:w-40" />
                </div>
                <Button onClick={conductResearch} loading={loading} className="w-full sm:w-auto sm:px-8">
                  {!loading && <Search className="w-4 h-4" />}
                  Research
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {research && !loading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="p-6 sm:p-7 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-base">Research Results</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyResearch}>
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                    {research}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading && (
            <Card className="p-8 flex flex-col items-center justify-center min-h-[240px] text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
              >
                <Loader2 className="w-6 h-6 text-primary-400" />
              </motion.div>
              <p className="font-medium text-gray-200">Researching {topic}...</p>
              <p className="text-sm text-gray-500 mt-1">Gathering insights across the web</p>
            </Card>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-primary-400" />
              <h3 className="font-semibold text-gray-200">Research History</h3>
            </div>
            {history.length === 0 ? (
              <EmptyState
                icon={<Search className="w-6 h-6 text-primary-400" />}
                title="No research yet"
                description="Topics you research will appear here"
                className="!py-8"
              />
            ) : (
              <div className="space-y-1">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(h)}
                    className="w-full text-left p-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-gray-200">Research Tips</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              {tips.map((tip) => (
                <p key={tip}>• {tip}</p>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
