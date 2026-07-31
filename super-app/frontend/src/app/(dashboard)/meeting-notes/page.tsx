'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, Tabs, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { StickyNote, FileText, ListChecks, Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

function AudioDropzone({ file, onFileChange }: { file: File | null; onFileChange: (file: File | null) => void }) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFileChange(accepted[0]);
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group relative overflow-hidden glass-card p-10 sm:p-12 text-center cursor-pointer transition-all border-2 border-dashed',
        isDragActive
          ? 'border-primary-500/60 bg-primary-500/[0.06] scale-[1.01]'
          : file
            ? 'border-emerald-500/30 hover:border-emerald-500/50'
            : 'border-white/10 hover:border-primary-500/40'
      )}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-[70px] group-hover:bg-primary-500/10 transition-colors" />
      <motion.div
        animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4 shadow-glow-sm"
      >
        <ListChecks className="w-6 h-6 text-primary-400" />
      </motion.div>
      <p className="font-medium text-gray-200 break-all">{file ? file.name : 'Drop your meeting recording here'}</p>
      <p className="text-sm text-gray-500 mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse · MP3, WAV'}</p>
      <input {...getInputProps()} />
    </div>
  );
}

export default function MeetingNotesPage() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processingAudio, setProcessingAudio] = useState(false);

  const generateSummary = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.meetingSummary(transcript);
      setSummary(res.data.summary);
      toast.success('Meeting summary generated');
    } catch { toast.error('Failed to generate summary'); }
    finally { setLoading(false); }
  };

  const processAudio = async () => {
    if (!audioFile) return;
    setProcessingAudio(true);
    try {
      const fd = new FormData();
      fd.append('file', audioFile);
      const sttRes = await aiAPI.stt(fd);
      setTranscript(sttRes.data.text);
      const summaryRes = await aiAPI.meetingSummary(sttRes.data.text);
      setSummary(summaryRes.data.summary);
      toast.success('Audio processed and summarized');
    } catch { toast.error('Failed to process audio'); }
    finally { setProcessingAudio(false); }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'transcript', label: 'Paste Transcript', icon: <FileText className="w-4 h-4" /> },
    { id: 'audio', label: 'Upload Audio', icon: <ListChecks className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        icon={<StickyNote className="w-6 h-6 text-white" />}
        title="Meeting Notes Generator"
        subtitle="Upload audio or paste transcript to generate structured meeting notes"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs tabs={tabs}>
          {(activeTab) => (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {activeTab === 'transcript' && (
                <Card gradientBorder className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste meeting transcript here..."
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="min-h-[220px]"
                    />
                    <Button onClick={generateSummary} loading={loading} className="w-full sm:w-auto sm:px-8">
                      {!loading && <Sparkles className="w-4 h-4" />}
                      Generate Meeting Notes
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'audio' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <AudioDropzone file={audioFile} onFileChange={setAudioFile} />
                    <Button onClick={processAudio} loading={processingAudio} disabled={!audioFile} className="w-full sm:w-auto sm:px-8">
                      {!processingAudio && <ListChecks className="w-4 h-4" />}
                      Process & Summarize
                    </Button>
                    {transcript && !processingAudio && (
                      <div className="glass-card p-4">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Transcript</span>
                        <p className="text-sm whitespace-pre-wrap text-gray-400 max-h-[200px] overflow-y-auto">{transcript}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {loading && activeTab === 'transcript' && (
                <Card className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
                  >
                    <Loader2 className="w-6 h-6 text-primary-400" />
                  </motion.div>
                  <p className="font-medium text-gray-200">Structuring your meeting notes...</p>
                  <p className="text-sm text-gray-500 mt-1">Extracting action items, decisions and summaries</p>
                </Card>
              )}

              {processingAudio && activeTab === 'audio' && (
                <Card className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
                  >
                    <Loader2 className="w-6 h-6 text-primary-400" />
                  </motion.div>
                  <p className="font-medium text-gray-200">Processing your recording...</p>
                  <p className="text-sm text-gray-500 mt-1">Transcribing and summarizing your meeting</p>
                </Card>
              )}

              {summary && !loading && !processingAudio && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card className="p-6 sm:p-7 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
                    <CardHeader>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <CardTitle className="text-base">Meeting Notes</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                        {summary}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!summary && !loading && !processingAudio && (
                <Card className="p-6 sm:p-7">
                  <EmptyState
                    icon={<StickyNote className="w-6 h-6 text-primary-400" />}
                    title="No meeting notes yet"
                    description="Paste a transcript or upload a recording to generate structured notes"
                    className="!py-10"
                  />
                </Card>
              )}
            </motion.div>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
