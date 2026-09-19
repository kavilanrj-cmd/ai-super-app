'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Textarea, Tabs, PageHeader } from '@/components/ui';
import { AIResponse } from '@/components/ai';
import { aiAPI } from '@/lib/api';
import { Mic, Volume2, Play, Pause, RotateCcw, Download, Check, Copy, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const TTS_MAX_CHARS = 200;

const MIN_AUDIO_BYTES = 512;

async function sniffAudioFormat(blob: Blob): Promise<'wav' | 'mp3' | null> {
  try {
    const buf = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    const ascii = (from: number, len: number) => {
      let s = '';
      for (let i = from; i < from + len && i < buf.length; i++) s += String.fromCharCode(buf[i]);
      return s;
    };
    if (buf.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WAVE') return 'wav';
    if (buf.length >= 3 && ascii(0, 3) === 'ID3') return 'mp3';
    if (buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return 'mp3';
    return null;
  } catch {
    return null;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ttsFileDetails(blob: Blob): { name: string; label: string } {
  const type = (blob.type || '').toLowerCase();
  const isMp3 = type.includes('mpeg') || type.includes('mp3');
  return {
    name: `ai-super-app-voice.${isMp3 ? 'mp3' : 'wav'}`,
    label: isMp3 ? 'MP3 audio' : 'WAV audio',
  };
}

const downloadLinkClasses =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed selected-none select-none px-4 py-2 text-sm rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm';

function TTSPlayer({ url, blob }: { url: string; blob: Blob }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Set the new blob URL imperatively and trigger a fresh load cycle so the
  // element actually fetches metadata for THIS url (React's `src` attribute
  // alone leaves the element stuck on the previous, possibly revoked, URL).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setReady(false);
    setFailed(false);
    audio.src = url;
    audio.load();
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onCanPlay = () => setReady(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => setFailed(true);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setFailed(true));
    else audio.pause();
  };

  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => setFailed(true));
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const { name: fileName, label: fileLabel } = ttsFileDetails(blob);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-3"
    >
      <audio ref={audioRef} className="hidden" preload="auto" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={replay}
          disabled={!ready}
          aria-label="Replay"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
        <span className="text-xs text-gray-400 tabular-nums">
          {formatTime(current)} / {ready ? formatTime(duration) : '—:—'}
        </span>
        {ready && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Audio ready
          </span>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={current}
        onChange={(e) => seek(Number(e.target.value))}
        disabled={!ready}
        aria-label="Seek"
        className="w-full accent-primary-500 disabled:opacity-40"
      />
      {failed && <p className="text-xs text-rose-400">Audio failed to load. Try generating again.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <span className="text-xs text-gray-500">
          {fileName} · {fileLabel} · {(blob.size / 1024).toFixed(1)} KB
        </span>
        <a
          href={url}
          download={fileName}
          aria-disabled={!ready}
          aria-label="Download audio"
          onClick={(e) => {
            if (!ready) {
              e.preventDefault();
              toast.error('Audio is still loading. Please wait.');
            }
          }}
          className={cn(downloadLinkClasses, !ready && 'opacity-50 cursor-not-allowed')}
        >
          <Download className="w-4 h-4" />
          Download Audio
        </a>
      </div>
    </motion.div>
  );
}

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
  const [ttsBlob, setTtsBlob] = useState<Blob | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const ttsUrlRef = useRef<string | null>(null);

  // Revoke the current blob URL when the page unmounts.
  useEffect(() => {
    return () => {
      if (ttsUrlRef.current) URL.revokeObjectURL(ttsUrlRef.current);
    };
  }, []);

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
    const trimmed = ttsText.trim();
    if (!trimmed) {
      setTtsError('Please enter some text to convert to speech.');
      return;
    }
    if (trimmed.length > TTS_MAX_CHARS) {
      setTtsError(`Text must be ${TTS_MAX_CHARS} characters or fewer (currently ${trimmed.length}).`);
      return;
    }
    setTtsLoading(true);
    setTtsError('');
    try {
      const res = await aiAPI.tts(trimmed);
      const blob = res.data as Blob;
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Generated audio is empty or invalid.');
      }
      // A healthy TTS clip is tens of KBs. Anything tiny (e.g. a JSON error
      // body such as the old /voice/tts `{"audio_url": ...}` contract) is not
      // playable audio, even when the status code is 200.
      if (blob.size < MIN_AUDIO_BYTES) {
        throw new Error(
          `The server returned a non-audio response (${(blob.size / 1024).toFixed(1)} KB). ` +
            'The backend server is likely running outdated code — restart it, then try again.'
        );
      }
      const format = await sniffAudioFormat(blob);
      if (!format) {
        throw new Error(
          `The server returned an invalid audio file (${blob.type || 'unknown type'}, ${blob.size} bytes). ` +
            'Restart the backend server and try again.'
        );
      }
      // Revoke the previous object URL (playback of the old audio finished),
      // keep the current one alive until it is replaced or the page unmounts.
      if (ttsUrlRef.current) {
        URL.revokeObjectURL(ttsUrlRef.current);
        ttsUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      ttsUrlRef.current = url;
      setTtsBlob(blob);
      setTtsAudioUrl(url);
      toast.success('Speech generated');
    } catch (err: any) {
      let message = 'Speech generation failed. Please try again.';
      try {
        const data = err?.response?.data;
        if (data instanceof Blob) {
          if (data.type && !data.type.startsWith('audio/') && data.size < MIN_AUDIO_BYTES) {
            message = 'The server returned an error (not audio). Restart the backend server and try again.';
          } else {
            const body = JSON.parse(await data.text());
            if (body?.detail) message = String(body.detail);
          }
        } else if (err?.message) {
          message = err.message;
        }
      } catch { /* keep fallback message */ }
      setTtsError(message);
      toast.error('Speech generation failed');
    } finally {
      setTtsLoading(false);
    }
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
                          <AIResponse content={sttText} disableToolbar />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'tts' && !ttsLoading && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter text to convert to speech..."
                      value={ttsText}
                      onChange={(e) => {
                        setTtsText(e.target.value);
                        if (ttsError) setTtsError('');
                      }}
                      maxLength={TTS_MAX_CHARS}
                      error={ttsError || undefined}
                      hint={`${ttsText.length}/${TTS_MAX_CHARS} characters · Groq Orpheus TTS`}
                    />
                    <Button onClick={generateSpeech} loading={ttsLoading} className="w-full sm:w-auto sm:px-8">
                      {!ttsLoading && <Volume2 className="w-4 h-4" />}
                      Generate Speech
                    </Button>
                    {ttsAudioUrl && ttsBlob && <TTSPlayer url={ttsAudioUrl} blob={ttsBlob} />}
                  </CardContent>
                </Card>
              )}

              {ttsLoading && activeTab === 'tts' && (
                <Card className="p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
                  >
                    <Loader2 className="w-6 h-6 text-primary-400" />
                  </motion.div>
                  <p className="font-medium text-gray-200">Generating speech...</p>
                  <p className="text-sm text-gray-500 mt-1">Voicing your text with Groq Orpheus</p>
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