'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Input, PageHeader, EmptyState, Markdown } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { FileText, Upload, Send, Bot, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { content: string; score: number }[];
}

export default function PdfChatPage() {
  const [pdfText, setPdfText] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);

  const processDocument = async () => {
    if (!pdfText.trim() || !collectionName.trim()) return;
    setLoading(true);
    try {
      await aiAPI.ragProcess(collectionName, pdfText);
      toast.success('Document processed. You can now ask questions.');
    } catch { toast.error('Failed to process document'); }
    finally { setLoading(false); }
  };

  const askQuestion = async () => {
    if (!query.trim() || !collectionName.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setQueryLoading(true);

    try {
      const res = await aiAPI.ragQuery(collectionName, query);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.data.answer || res.data.response || 'No answer found',
        sources: res.data.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch { toast.error('Failed to get answer'); }
    finally { setQueryLoading(false); }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="AI PDF Chat"
        subtitle="Upload document text and ask questions - RAG-powered chat with your documents"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card gradientBorder className="p-6 sm:p-7">
          <CardContent className="space-y-4">
            <Input label="Collection Name" placeholder="e.g., my-document" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
            <Textarea label="Document Text" placeholder="Paste the document text here (PDF, DOCX, TXT content)..." value={pdfText} onChange={(e) => setPdfText(e.target.value)} className="min-h-[160px]" />
            <Button onClick={processDocument} loading={loading} className="w-full sm:w-auto sm:px-8">
              {!loading && <Upload className="w-4 h-4" />}
              Process Document
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 sm:p-7">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-400" />
              </div>
              <CardTitle className="text-base">Chat with Document</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.length === 0 && (
                <EmptyState
                  icon={<BookOpen className="w-6 h-6 text-primary-400" />}
                  title="Ask about your document"
                  description="Process a document above, then ask questions about its contents"
                  className="!py-10"
                />
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
                        <Markdown content={msg.content} />
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/[0.07]">
                          <p className="text-xs text-gray-500 mb-2">Sources:</p>
                          {msg.sources.map((s, j) => (
                            <div key={j} className="text-xs text-gray-400 mb-1 p-2 bg-white/5 rounded">
                              <p className="line-clamp-2">{s.content}</p>
                              <p className="text-gray-500 mt-1">Relevance: {((1 - s.score) * 100).toFixed(0)}%</p>
                            </div>
                          ))}
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

            <div className="flex gap-3">
              <Input
                placeholder="Ask a question about your document..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              />
              <Button onClick={askQuestion} disabled={!query.trim() || queryLoading} size="icon" aria-label="Send question">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
