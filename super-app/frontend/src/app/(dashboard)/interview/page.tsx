'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Tabs, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { GraduationCap, Copy, Check, Sparkles, Brain, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ResultPanel({ icon, title, text, onCopy, copied }: { icon: React.ReactNode; title: string; text: string; onCopy: () => void; copied: boolean }) {
  return (
    <Card className="p-6 sm:p-7 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
          {text}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingPanel({ title }: { title: string }) {
  return (
    <Card className="p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-5"
      >
        <Loader2 className="w-7 h-7 text-primary-400" />
      </motion.div>
      <p className="font-medium text-gray-200">{title}</p>
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs">The AI is crafting a personalized response for you.</p>
    </Card>
  );
}

export default function InterviewPrepPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [preparation, setPreparation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [questions, setQuestions] = useState('');
  const [qRole, setQRole] = useState('');
  const [qCompany, setQCompany] = useState('');
  const [qLoading, setQLoading] = useState(false);

  const generatePrep = async () => {
    if (!role.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('role', role);
    fd.append('company', company || 'General');
    fd.append('interview_type', interviewType);
    fd.append('experience_level', experienceLevel);
    try {
      const res = await aiAPI.generateInterviewPrep(fd);
      setPreparation(res.data.preparation);
      toast.success('Interview prep generated');
    } catch { toast.error('Failed to generate'); }
    finally { setLoading(false); }
  };

  const generateQuestions = async () => {
    if (!qRole.trim()) return;
    setQLoading(true);
    try {
      const res = await aiAPI.interview(qRole, qCompany || undefined);
      setQuestions(res.data.questions);
      toast.success('Questions generated');
    } catch { toast.error('Failed to generate'); }
    finally { setQLoading(false); }
  };

  const copyPrep = async () => {
    await navigator.clipboard.writeText(preparation);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyQuestions = async () => {
    await navigator.clipboard.writeText(questions);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<GraduationCap className="w-6 h-6 text-white" />}
        title="Interview Preparation"
        subtitle="Technical questions, HR questions, coding challenges, and mock interview prep"
        gradient="from-indigo-500 to-violet-500"
      />

      <Tabs tabs={[
        { id: 'prep', label: 'Full Preparation', icon: <Brain className="w-4 h-4" /> },
        { id: 'questions', label: 'Practice Questions', icon: <MessageSquare className="w-4 h-4" /> },
      ]}>
        {(activeTab) => (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {activeTab === 'prep' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card gradientBorder className="p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">Interview Details</h3>
                        <p className="text-xs text-gray-500">Configure your preparation plan</p>
                      </div>
                    </div>
                    <CardContent className="space-y-4">
                      <Input label="Target Role" placeholder="e.g., Senior Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
                      <Input label="Company (optional)" placeholder="e.g., Google, Meta, Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
                      <Select label="Interview Type" options={[
                        { value: 'technical', label: 'Technical' },
                        { value: 'behavioral', label: 'Behavioral' },
                        { value: 'system-design', label: 'System Design' },
                        { value: 'coding', label: 'Coding' },
                        { value: 'full-loop', label: 'Full Loop' },
                      ]} value={interviewType} onChange={(e) => setInterviewType(e.target.value)} />
                      <Select label="Experience Level" options={[
                        { value: 'entry', label: 'Entry Level' },
                        { value: 'mid', label: 'Mid Level' },
                        { value: 'senior', label: 'Senior' },
                        { value: 'staff', label: 'Staff+' },
                      ]} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} />
                      <Button onClick={generatePrep} loading={loading} variant="gradient" className="w-full">
                        <Sparkles className="w-4 h-4" /> Generate Preparation
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  {preparation ? (
                    <ResultPanel
                      icon={<Check className="w-4 h-4 text-emerald-400" />}
                      title="Your Preparation"
                      text={preparation}
                      onCopy={copyPrep}
                      copied={copied}
                    />
                  ) : loading ? (
                    <LoadingPanel title="Preparing your interview plan..." />
                  ) : (
                    <Card className="p-6 flex flex-col justify-center min-h-[420px]">
                      <EmptyState
                        icon={<Brain className="w-6 h-6 text-primary-400" />}
                        title="Fill in the details to get started"
                        description="Your full interview preparation plan will appear here."
                        className="!py-0"
                      />
                    </Card>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card gradientBorder className="p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">Question Settings</h3>
                        <p className="text-xs text-gray-500">Set up the role you are preparing for</p>
                      </div>
                    </div>
                    <CardContent className="space-y-4">
                      <Input label="Target Role" placeholder="e.g., Data Scientist" value={qRole} onChange={(e) => setQRole(e.target.value)} />
                      <Input label="Company (optional)" placeholder="e.g., Amazon" value={qCompany} onChange={(e) => setQCompany(e.target.value)} />
                      <Button onClick={generateQuestions} loading={qLoading} variant="gradient" className="w-full">
                        <Sparkles className="w-4 h-4" /> Generate Questions & Answers
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  {questions ? (
                    <ResultPanel
                      icon={<Check className="w-4 h-4 text-emerald-400" />}
                      title="Questions & Answers"
                      text={questions}
                      onCopy={copyQuestions}
                      copied={copied}
                    />
                  ) : qLoading ? (
                    <LoadingPanel title="Generating practice questions..." />
                  ) : (
                    <Card className="p-6 flex flex-col justify-center min-h-[420px]">
                      <EmptyState
                        icon={<MessageSquare className="w-6 h-6 text-primary-400" />}
                        title="Generate practice questions"
                        description="Your questions and answers will appear here."
                        className="!py-0"
                      />
                    </Card>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </Tabs>
    </div>
  );
}
