'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Input, Select, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { FileEdit, Copy, Check, Download, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCoverLetter = async () => {
    if (!jobTitle.trim() || !company.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('job_title', jobTitle);
    fd.append('company', company);
    fd.append('skills', skills);
    fd.append('experience', experience);
    fd.append('tone', tone);
    try {
      const res = await aiAPI.generateCoverLetter(fd);
      setCoverLetter(res.data.cover_letter);
      toast.success('Cover letter generated');
    } catch { toast.error('Failed to generate'); }
    finally { setLoading(false); }
  };

  const copyLetter = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<FileEdit className="w-6 h-6 text-white" />}
        title="Cover Letter Generator"
        subtitle="Generate personalized, professional cover letters"
        gradient="from-purple-500 to-pink-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradientBorder className="p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">Letter Details</h3>
                <p className="text-xs text-gray-500">Tell the AI about the role and your experience</p>
              </div>
            </div>
            <CardContent className="space-y-4">
              <Input label="Job Title" placeholder="e.g., Senior Software Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              <Input label="Company" placeholder="e.g., Google" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input label="Your Key Skills" placeholder="e.g., React, Python, AWS, System Design" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <Textarea label="Relevant Experience" placeholder="Briefly describe your relevant experience..." value={experience} onChange={(e) => setExperience(e.target.value)} />
              <Select label="Tone" options={[
                { value: 'professional', label: 'Professional' },
                { value: 'enthusiastic', label: 'Enthusiastic' },
                { value: 'confident', label: 'Confident' },
                { value: 'formal', label: 'Formal' },
              ]} value={tone} onChange={(e) => setTone(e.target.value)} />
              <Button onClick={generateCoverLetter} loading={loading} variant="gradient" className="w-full">
                <Sparkles className="w-4 h-4" /> Generate Cover Letter
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {coverLetter ? (
            <Card className="p-6 sm:p-7 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <CardTitle className="text-base">Your Cover Letter</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={downloadLetter} title="Download">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyLetter}>
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                  {coverLetter}
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
              <p className="font-medium text-gray-200">Crafting your cover letter...</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs">The AI is tailoring your letter to the role and company.</p>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col justify-center min-h-[420px]">
              <EmptyState
                icon={<FileEdit className="w-6 h-6 text-primary-400" />}
                title="Your cover letter will appear here"
                description="Fill in the details and generate a personalized cover letter."
                className="!py-0"
              />
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
