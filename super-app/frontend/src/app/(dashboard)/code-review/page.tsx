'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Select } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Code, Check, Copy, Shield, Zap, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui';

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

const samples: Record<string, string> = {
  python: `def calculate_total(items):
    total = 0
    for item in items:
        total += item.price * item.qty
    return total

# Review this for edge cases, performance and style`,
  javascript: `function fetchUsers(ids) {
  const users = [];
  ids.forEach(id => {
    fetch('/api/users/' + id).then(res => res.json()).then(u => users.push(u));
  });
  return users;
}`,
};

const features = [
  { icon: Shield, label: 'Security', desc: 'Vulnerability detection' },
  { icon: Zap, label: 'Performance', desc: 'Optimization suggestions' },
  { icon: Sparkles, label: 'Best Practices', desc: 'Code quality insights' },
];

export default function CodeReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const reviewCode = async () => {
    if (!code.trim()) return toast.error('Please paste some code first');
    setLoading(true);
    try {
      const res = await aiAPI.reviewCode(code, language);
      setReview(res.data.review);
      toast.success('Code review complete');
    } catch { toast.error('Review failed'); }
    finally { setLoading(false); }
  };

  const copyReview = async () => {
    await navigator.clipboard.writeText(review);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<Code className="w-6 h-6 text-white" />}
        title="AI Code Reviewer"
        subtitle="Get AI-powered reviews with bug detection, security analysis, and optimization"
        actions={
          <div className="flex items-center gap-2">
            {features.map((f) => (
              <span key={f.label} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-xs text-gray-400">
                <f.icon className="w-3.5 h-3.5 text-primary-400" />
                {f.label}
              </span>
            ))}
          </div>
        }
      />

      <Card gradientBorder className="p-6 sm:p-7">
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select options={languages} value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full sm:w-44" />
            <Button onClick={reviewCode} loading={loading} className="flex-1 sm:flex-none sm:px-8">
              <Code className="w-4 h-4" /> Review Code
            </Button>
            {samples[language] && !code && (
              <Button variant="outline" onClick={() => setCode(samples[language])} className="sm:flex-none">
                Load sample
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              placeholder={`Paste your ${language} code here...`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono min-h-[300px] text-[13px] leading-relaxed resize-y"
            />
            {code && (
              <button
                onClick={() => { setCode(''); setReview(''); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {review && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="p-6 sm:p-7 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <CardTitle className="text-base">Review Results</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={copyReview}>
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                {review}
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
          <p className="font-medium text-gray-200">Analyzing your code...</p>
          <p className="text-sm text-gray-500 mt-1">Checking style, security, performance and edge cases</p>
        </Card>
      )}
    </div>
  );
}
