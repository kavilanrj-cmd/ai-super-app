'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Select } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Bug, AlertTriangle, Copy, Check, Scan, Loader2, ShieldAlert, Crosshair, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui';

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'solidity', label: 'Solidity' },
];

const samples: Record<string, string> = {
  python: `def process(data):
    result = []
    for i in range(len(data)):
        result.append(data[i] * 2)
    return result`,
  javascript: `const userInput = req.body.search;
const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
db.execute(query);`,
};

export default function BugFinderPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [findings, setFindings] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const findBugs = async () => {
    if (!code.trim()) return toast.error('Please paste some code first');
    setLoading(true);
    try {
      const res = await aiAPI.findBugs(code, language);
      setFindings(res.data.findings);
      toast.success('Bug analysis complete');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const copyFindings = async () => {
    await navigator.clipboard.writeText(findings);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<Bug className="w-6 h-6 text-white" />}
        title="AI Bug Finder"
        subtitle="Automatically detect bugs, vulnerabilities, dead code, and security issues"
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/[0.06] border border-red-500/20 text-xs text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" /> Vulnerabilities
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-400">
              <Radio className="w-3.5 h-3.5" /> Dead Code
            </span>
          </div>
        }
      />

      <Card gradientBorder className="p-6 sm:p-7">
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select options={languages} value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full sm:w-44" />
            <Button variant="danger" onClick={findBugs} loading={loading} className="flex-1 sm:flex-none sm:px-8">
              <Scan className="w-4 h-4" /> Scan for Bugs
            </Button>
            {samples[language] && !code && (
              <Button variant="outline" onClick={() => setCode(samples[language])} className="sm:flex-none">
                Load sample
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              placeholder={`Paste your ${language} code to analyze...`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono min-h-[300px] text-[13px] leading-relaxed resize-y"
            />
            {code && (
              <button
                onClick={() => { setCode(''); setFindings(''); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {findings && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="p-6 sm:p-7 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/15 to-red-500/15 border border-amber-500/25 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <CardTitle className="text-base">Analysis Results</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={copyFindings}>
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                {findings}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading && (
        <Card className="p-8 flex flex-col items-center justify-center min-h-[240px] text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-red-500/15 border border-amber-500/25 flex items-center justify-center mb-4"
          >
            <Loader2 className="w-6 h-6 text-amber-400" />
          </motion.div>
          <p className="font-medium text-gray-200">Scanning your code...</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 justify-center">
            <Crosshair className="w-3 h-3" /> Hunting for bugs and vulnerabilities
          </p>
        </Card>
      )}
    </div>
  );
}
