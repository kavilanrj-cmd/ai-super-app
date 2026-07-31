'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Textarea, Tabs, PageHeader } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Mic, Volume2, Play, Check, Copy, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const AUDIO_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1\/?$/, '');

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
        <Mic className="w-6 h-6 text-primary-400" />
      </motion.div>
      <p className="font-medium text-gray-200 break-all">{file ? file.name : 'Drop your audio file here'}</p>
      <p className="text-sm text-gray-500 mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse · MP3, WAV'}</p>
      <input {...getInputProps()} />
    </div>
  );
}

export default function VoiceAIPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sttText, setSttText] = useState('');
  const [sttLoading, setSttLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [ttsText, setTtsText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);

  const transcribeAudio = async () => {
    if (!audioFile) return;
    setSttLoading(true);
    const fd = new FormData();
    fd.append('file', audioFile);
    try {
      const res = await aiAPI.stt(fd);
      setSttText(res.data.text);
      toast.success('Audio transcribed');
    } catch { toast.error('Transcription failed'); }
    finally { setSttLoading(false); }
  };

  const generateSpeech = async () => {
    if (!ttsText.trim()) return;
    setTtsLoading(true);
    try {
      const res = await aiAPI.tts(ttsText);
      setAudioUrl(res.data.audio_url);
      toast.success('Speech generated');
    } catch { toast.error('Speech generation failed'); }
    finally { setTtsLoading(false); }
  };

  const copyTranscript = async () => {
    await navigator.clipboard.writeText(sttText);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'stt', label: 'Speech to Text', icon: <Mic className="w-4 h-4" /> },
    { id: 'tts', label: 'Text to Speech', icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        icon={<Volume2 className="w-6 h-6 text-white" />}
        title="Voice AI"
        subtitle="Speech to text, text to speech, and voice chat"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs tabs={tabs}>
          {(activeTab) => (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {activeTab === 'stt' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <AudioDropzone file={audioFile} onFileChange={setAudioFile} />
                    <Button onClick={transcribeAudio} loading={sttLoading} disabled={!audioFile} className="w-full sm:w-auto sm:px-8">
                      {!sttLoading && <Mic className="w-4 h-4" />}
                      Transcribe Audio
                    </Button>
                    {sttText && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Transcript</span>
                            <button
                              onClick={copyTranscript}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                              aria-label="Copy transcript"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">{sttText}</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'tts' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Enter text to convert to speech..." value={ttsText} onChange={(e) => setTtsText(e.target.value)} />
                    <Button onClick={generateSpeech} loading={ttsLoading} className="w-full sm:w-auto sm:px-8">
                      {!ttsLoading && <Volume2 className="w-4 h-4" />}
                      Generate Speech
                    </Button>
                    {audioUrl && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center shrink-0">
                            <Play className="w-5 h-5 text-primary-400" />
                          </div>
                          <audio controls className="flex-1 min-w-0">
                            <source src={`${AUDIO_BASE}/${audioUrl}`} />
                          </audio>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {sttLoading && activeTab === 'stt' && (
                <Card className="p-8 flex flex-col items-center justify-center min-h-[160px] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
                  >
                    <Loader2 className="w-6 h-6 text-primary-400" />
                  </motion.div>
                  <p className="font-medium text-gray-200">Transcribing audio...</p>
                  <p className="text-sm text-gray-500 mt-1">Listening to your recording</p>
                </Card>
              )}
            </motion.div>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
