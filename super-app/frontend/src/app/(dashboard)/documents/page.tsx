'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { docAPI } from '@/lib/api';
import {
  FileText, Mail, FileSignature, FileCheck, ClipboardList, Sparkles,
  Loader2, Copy, Check, Download, Trash2, FilePlus2, Wand2, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

const docTypes = [
  { type: 'resume', icon: FileText, label: 'Resume', desc: 'Professional resume', gradient: 'from-blue-500 to-cyan-500' },
  { type: 'cover_letter', icon: Mail, label: 'Cover Letter', desc: 'Job application letter', gradient: 'from-purple-500 to-pink-500' },
  { type: 'sop', icon: FileSignature, label: 'SOP', desc: 'Statement of purpose', gradient: 'from-emerald-500 to-teal-500' },
  { type: 'email', icon: Mail, label: 'Email', desc: 'Professional email', gradient: 'from-amber-500 to-orange-500' },
  { type: 'proposal', icon: FileCheck, label: 'Proposal', desc: 'Business proposal', gradient: 'from-cyan-500 to-blue-500' },
  { type: 'report', icon: ClipboardList, label: 'Report', desc: 'Detailed report', gradient: 'from-pink-500 to-rose-500' },
];

const sampleContexts: Record<string, string> = {
  resume: 'I am a software engineer with 5 years of experience in React, Node.js and Python. Currently working at a fintech startup. Looking for senior roles.',
  cover_letter: 'Applying for Senior Software Engineer at Google. I have 5 years experience with React and distributed systems. Led a team of 4 engineers.',
  sop: 'I want to apply for a Masters in Computer Science at MIT. I have a B.Tech in CSE with 8.5 CGPA and 2 years research experience in ML.',
  email: 'Writing a professional follow-up email to a client after a project proposal meeting held yesterday.',
  proposal: 'Proposing a website redesign project for a local restaurant client with a budget of $5000 and 3 week timeline.',
  report: 'Monthly sales report for Q1: revenue increased 15%, new customers up 8%, customer churn down 3%.',
};

export default function DocumentsPage() {
  const [docType, setDocType] = useState('resume');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    docAPI.list().then((res) => setHistory(res.data || [])).catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const current = docTypes.find((d) => d.type === docType) || docTypes[0];

  const generate = async () => {
    if (!context.trim()) return toast.error('Please provide context');
    setLoading(true);
    try {
      const res = await docAPI.generate(docType, {
        title: context.split('\n')[0] || 'Untitled',
        context,
        user_details: context
      });
      setResult(res.data.content);
      toast.success('Document generated!');
      docAPI.list().then((r) => setHistory(r.data || [])).catch(() => {});
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to generate document';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}-document.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const deleteDoc = async (id: number) => {
    try {
      await docAPI.delete(id);
      setHistory((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<FilePlus2 className="w-6 h-6 text-white" />}
        title="Document Generator"
        subtitle="AI-powered creation of resumes, cover letters, proposals and more"
      />

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {docTypes.map((dt, i) => (
          <motion.button
            key={dt.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            onClick={() => { setDocType(dt.type); setResult(''); }}
            className={cn(
              'glass-card !rounded-xl p-3.5 text-left group transition-all',
              docType === dt.type
                ? 'border-primary-500/40 bg-primary-500/[0.06]'
                : 'hover:border-white/15'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110', dt.gradient)}>
              <dt.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-200">{dt.label}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{dt.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', current.gradient)}>
                <current.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">{current.label} Generator</h3>
                <p className="text-xs text-gray-500">{current.desc}</p>
              </div>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={`Describe what you need... Include your details, experience, target role, etc.`}
              className="input-field min-h-[220px] resize-y"
              rows={8}
            />
            <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> Try an example:
              </span>
              <button
                onClick={() => setContext(sampleContexts[docType] || sampleContexts.resume)}
                className="text-[11px] text-primary-400 hover:text-primary-300 border border-primary-500/20 bg-primary-500/5 rounded-full px-2.5 py-1 transition-colors"
              >
                Use sample
              </button>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {current.label}
                </>
              )}
            </button>
          </div>

          {/* History */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4.5 h-4.5 text-primary-400" />
              <h3 className="font-semibold text-gray-200">Recent Documents</h3>
            </div>
            {historyLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6 text-primary-400" />}
                title="No documents yet"
                description="Generated documents will appear here"
                className="!py-8"
              />
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{doc.title || doc.doc_type || 'Untitled'}</p>
                      <p className="text-[11px] text-gray-600">
                        {doc.doc_type} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => docAPI.generate(doc.doc_type, { context: doc.context || doc.content }).then((r) => { setResult(r.data.content); toast.success('Loaded document'); }).catch(() => {})}
                      className="p-2 text-gray-500 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {result ? (
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-200">Generated {current.label}</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyResult}
                    className="p-2 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadResult}
                    className="p-2 text-gray-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-500/10"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative bg-black/30 border border-white/[0.06] rounded-xl p-5 max-h-[500px] overflow-y-auto">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{result}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={copyResult} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button onClick={downloadResult} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[420px] text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-5"
              >
                <Loader2 className="w-7 h-7 text-primary-400" />
              </motion.div>
              <p className="font-medium text-gray-200">Crafting your {current.label.toLowerCase()}...</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
                The AI is structuring your content with professional formatting.
              </p>
            </div>
          ) : (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[420px] border-2 border-dashed border-white/[0.07]">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-fuchsia-500/10 border border-primary-500/20 flex items-center justify-center mb-5"
              >
                <Sparkles className="w-7 h-7 text-primary-400" />
              </motion.div>
              <p className="text-gray-300 font-medium">Your document will appear here</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
                Pick a document type, describe what you need, and let AI handle the rest.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
