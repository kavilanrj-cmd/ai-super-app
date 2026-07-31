'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Input, Select, Tabs, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Mail, Send, Edit3, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
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
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs">The AI is polishing your email to match the target tone.</p>
    </Card>
  );
}

export default function EmailAssistantPage() {
  const [emailType, setEmailType] = useState('professional');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [improveEmail, setImproveEmail] = useState('');
  const [improveTone, setImproveTone] = useState('professional');
  const [improvedResult, setImprovedResult] = useState('');
  const [improving, setImproving] = useState(false);

  const generateEmail = async () => {
    if (!context.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.generateEmail(emailType, context, recipientName, recipientEmail, subject, tone);
      setGeneratedEmail(res.data.email);
      toast.success('Email generated');
    } catch { toast.error('Failed to generate email'); }
    finally { setLoading(false); }
  };

  const improveEmailText = async () => {
    if (!improveEmail.trim()) return;
    setImproving(true);
    try {
      const res = await aiAPI.improveEmail(improveEmail, improveTone);
      setImprovedResult(res.data.improved_email);
      toast.success('Email improved');
    } catch { toast.error('Failed to improve email'); }
    finally { setImproving(false); }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<Mail className="w-6 h-6 text-white" />}
        title="Email Assistant"
        subtitle="Generate professional emails, improve grammar, and adjust tone"
        gradient="from-sky-500 to-blue-500"
      />

      <Tabs tabs={[
        { id: 'generate', label: 'Generate Email', icon: <Send className="w-4 h-4" /> },
        { id: 'improve', label: 'Improve Email', icon: <Edit3 className="w-4 h-4" /> },
      ]}>
        {(activeTab) => (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {activeTab === 'generate' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card gradientBorder className="p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">Email Details</h3>
                        <p className="text-xs text-gray-500">Set up your email requirements</p>
                      </div>
                    </div>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Select label="Email Type" options={[
                          { value: 'professional', label: 'Professional' },
                          { value: 'follow-up', label: 'Follow Up' },
                          { value: 'introduction', label: 'Introduction' },
                          { value: 'meeting-request', label: 'Meeting Request' },
                          { value: 'thank-you', label: 'Thank You' },
                          { value: 'proposal', label: 'Proposal' },
                          { value: 'complaint', label: 'Complaint' },
                        ]} value={emailType} onChange={(e) => setEmailType(e.target.value)} />
                        <Select label="Tone" options={[
                          { value: 'professional', label: 'Professional' },
                          { value: 'formal', label: 'Formal' },
                          { value: 'friendly', label: 'Friendly' },
                          { value: 'persuasive', label: 'Persuasive' },
                          { value: 'empathetic', label: 'Empathetic' },
                        ]} value={tone} onChange={(e) => setTone(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                        <Input label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                      </div>
                      <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      <Textarea label="Context / Key Points" placeholder="Describe the purpose of the email..." value={context} onChange={(e) => setContext(e.target.value)} />
                      <Button onClick={generateEmail} loading={loading} variant="gradient" className="w-full">
                        <Mail className="w-4 h-4" /> Generate Email
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  {generatedEmail ? (
                    <ResultPanel
                      icon={<Send className="w-4 h-4 text-emerald-400" />}
                      title="Generated Email"
                      text={generatedEmail}
                      onCopy={() => copyText(generatedEmail)}
                      copied={copied}
                    />
                  ) : loading ? (
                    <LoadingPanel title="Generating your email..." />
                  ) : (
                    <Card className="p-6 flex flex-col justify-center min-h-[420px]">
                      <EmptyState
                        icon={<Mail className="w-6 h-6 text-primary-400" />}
                        title="Your email will appear here"
                        description="Describe the purpose and the AI will write a professional email."
                        className="!py-0"
                      />
                    </Card>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'improve' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card gradientBorder className="p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Edit3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200">Improve Your Email</h3>
                        <p className="text-xs text-gray-500">Paste your draft to polish and adjust tone</p>
                      </div>
                    </div>
                    <CardContent className="space-y-4">
                      <Select label="Target Tone" options={[
                        { value: 'professional', label: 'Professional' },
                        { value: 'formal', label: 'Formal' },
                        { value: 'friendly', label: 'Friendly' },
                        { value: 'concise', label: 'Concise' },
                      ]} value={improveTone} onChange={(e) => setImproveTone(e.target.value)} />
                      <Textarea label="Paste your email" placeholder="Paste the email you want to improve..." value={improveEmail} onChange={(e) => setImproveEmail(e.target.value)} />
                      <Button onClick={improveEmailText} loading={improving} variant="gradient" className="w-full">
                        <Edit3 className="w-4 h-4" /> Improve Email
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  {improvedResult ? (
                    <ResultPanel
                      icon={<Edit3 className="w-4 h-4 text-emerald-400" />}
                      title="Improved Version"
                      text={improvedResult}
                      onCopy={() => copyText(improvedResult)}
                      copied={copied}
                    />
                  ) : improving ? (
                    <LoadingPanel title="Improving your email..." />
                  ) : (
                    <Card className="p-6 flex flex-col justify-center min-h-[420px]">
                      <EmptyState
                        icon={<Edit3 className="w-6 h-6 text-primary-400" />}
                        title="Your improved email will appear here"
                        description="Paste your draft and adjust its tone and grammar."
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
