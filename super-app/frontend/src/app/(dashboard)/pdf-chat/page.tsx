'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, PageHeader } from '@/components/ui';
import { AIResponse, Sources } from '@/components/ai';
import { aiAPI } from '@/lib/api';
import {
  FileText, Upload, Send, Bot, User, BookOpen, FileUp, Files, X,
  CheckCircle2, Loader2, AlertCircle, FileArchive, ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { content: string; score: number }[];
}

type ProcessStatus = 'idle' | 'processing' | 'ready' | 'error';

interface DocMeta {
  filename?: string;
  file_type?: string;
  chunks?: number;
  characters?: number;
}

const suggestedQuestions = [
  'Summarize this document',
  'What are the key points?',
  'What skills are mentioned?',
  'What are the most important sections?',
  'Find specific information',
];

const statusConfig: Record<ProcessStatus, { label: string; color: string; icon: any }> = {
  idle: { label: 'No document', color: 'text-gray-500 bg-white/5 border-white/10', icon: Files },
  processing: { label: 'Processing...', color: 'text-primary-300 bg-primary-500/10 border-primary-500/25', icon: Loader2 },
  ready: { label: 'Document ready', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25', icon: CheckCircle2 },
  error: { label: 'Processing failed', color: 'text-red-300 bg-red-500/10 border-red-500/25', icon: AlertCircle },
};

export default function PdfChatPage() {
  const [pdfText, setPdfText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collectionName, setCollectionName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [docMeta, setDocMeta] = useState<DocMeta>({});
  const [queryLoading, setQueryLoading] = useState(false);

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      toast.error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT.`);
      return;
    }
    setFile(f);
    setStatus('idle');
  };

  const processDocument = async () => {
    const hasFile = !!file;
    const hasText = !!pdfText.trim();
    if (!collectionName.trim()) {
      toast.error('Enter a collection name first');
      return;
    }
    if (!hasFile && !hasText) {
      toast.error('Upload a document or paste its text');
      return;
    }

    setStatus('processing');
    try {
      const res = hasFile
        ? await aiAPI.ragProcessFile(collectionName.trim(), file, pdfText)
        : await aiAPI.ragProcess(collectionName.trim(), pdfText);
      const data = res.data || {};
      setDocMeta({
        filename: file?.name || data?.metadata?.filename,
        file_type: file?.name?.split('.')?.pop()?.toLowerCase() || data?.metadata?.file_type,
        chunks: data.chunks_created,
        characters: data.characters,
      });
      setStatus('ready');
      toast.success('Document processed. You can now ask questions.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to process document';
      setStatus('error');
      setDocMeta({});
      toast.error(typeof detail === 'string' ? detail : 'Failed to process document');
    }
  };

  const askQuestion = async (text?: string) => {
    const q = (text ?? query).trim();
    if (!q || !collectionName.trim() || queryLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setQueryLoading(true);

    try {
      const res = await aiAPI.ragQuery(collectionName.trim(), q);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.data.answer || res.data.response || 'No answer found',
        sources: res.data.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch { toast.error('Failed to get answer'); }
    finally { setQueryLoading(false); }
  };

  const StatusBadge = statusConfig[status];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="AI PDF Chat"
        subtitle="Upload a PDF or paste document text, then ask questions using RAG-powered chat"
      />

      {/* Document processing */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card gradientBorder className="p-6 sm:p-7">
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-100">Process a document</h3>
              </div>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', StatusBadge.color)}>
                <StatusBadge.icon className={cn('w-3.5 h-3.5', status === 'processing' && 'animate-spin')} />
                {StatusBadge.label}
              </span>
            </div>

            <Input
              label="Collection Name"
              placeholder="e.g., my-document"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />

            {/* Upload zone */}
            <div>
              <span className="block text-xs font-medium text-gray-400 mb-1.5">Upload PDF / DOCX / TXT</span>
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary-500/25 bg-primary-500/[0.06] p-3">
                  <FileText className="w-6 h-6 text-primary-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{file.type || 'document'} · {(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={clearFile}
                    aria-label="Remove file"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-full rounded-xl border border-dashed border-white/[0.15] p-6 text-center transition-all',
                    'hover:border-primary-500/50 hover:bg-primary-500/[0.04] group'
                  )}
                  disabled={status === 'processing'}
                >
                  <Upload className="w-6 h-6 mx-auto text-gray-500 group-hover:text-primary-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-300 font-medium">Click to choose a PDF, DOCX, or TXT file</p>
                  <p className="text-xs text-gray-500 mt-1">Your document text is extracted and indexed automatically</p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) selectFile(f);
                }}
              />
            </div>

            {/* Text fallback */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">Or paste document text (alternative)</span>
              </div>
              <Textarea
                placeholder={file ? 'Text version is optional when a file is attached...' : 'Paste the document text here (PDF, DOCX, TXT content)...'}
                value={pdfText}
                onChange={(e) => setPdfText(e.target.value)}
                className="min-h-[120px] bg-transparent"
              />
            </div>

            <Button
              onClick={processDocument}
              loading={status === 'processing'}
              disabled={status === 'processing' || (!file && !pdfText.trim())}
              className="w-full sm:w-auto sm:px-8"
            >
              {status !== 'processing' && <Upload className="w-4 h-4" />}
              {status === 'processing' ? 'Processing...' : 'Process Document'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document card when ready */}
      {status === 'ready' && docMeta.chunks != null && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <FileArchive className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{docMeta.filename || collectionName}</p>
                  <p className="text-xs text-gray-500">Collection: {collectionName}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {docMeta.file_type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-primary-300 bg-primary-500/10 border border-primary-500/25">
                    <FileText className="w-3 h-3" /> {docMeta.file_type.toUpperCase()}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-300 bg-white/5 border border-white/10">
                  <ListChecks className="w-3 h-3 text-primary-400" /> {docMeta.chunks} chunks
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Chat with document */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 sm:p-7">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <CardTitle className="text-base">Chat with Document</CardTitle>
                {status === 'ready' && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Answers use the processed document
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[420px] overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.length === 0 && (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-100">Ask anything about your document</h3>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
                    The AI will answer using the processed document. Process a document above to get started.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={cn('flex gap-3 group', msg.role === 'user' && 'justify-end')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center min-w-[32px] shrink-0 shadow-glow-sm mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn('flex flex-col max-w-[85%] sm:max-w-[78%]', msg.role === 'user' && 'items-end')}>
                    <div
                      className={cn(
                        'px-4 py-3.5 rounded-2xl',
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary-500/90 to-violet-600/90 text-white shadow-lg shadow-primary-500/20 border border-primary-400/30 rounded-br-md'
                          : 'glass-card !rounded-2xl border-white/[0.07] rounded-tl-md'
                      )}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <AIResponse content={msg.content} disableToolbar />
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3">
                          <Sources
                            sources={msg.sources.map((s, sj) => (
                              <div key={sj} className="flex flex-col gap-1">
                                <span className="line-clamp-2 text-gray-300">{s.content}</span>
                                <span className="text-xs text-gray-500">Relevance: {((1 - s.score) * 100).toFixed(0)}%</span>
                              </div>
                            ))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center min-w-[32px] shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {queryLoading && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center min-w-[32px] shrink-0 shadow-glow-sm animate-glow">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass-card !rounded-2xl px-4 py-3.5">
                    <div className="typing-indicator"><span /><span /><span /></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggested questions */}
            {status === 'ready' && messages.length < 3 && (
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => askQuestion(q)}
                    disabled={queryLoading}
                    className="px-3 py-1.5 rounded-full text-xs bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Ask a question about this document..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              />
              <Button onClick={() => askQuestion()} disabled={!query.trim() || queryLoading} size="icon" aria-label="Send question">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
