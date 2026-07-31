'use client';

import { useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, Textarea, Tabs, Select, PageHeader } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { Image, FileText, Type, Sparkles, ScanText, Captions, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const styles = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'sketch', label: 'Sketch' },
  { value: '3d-render', label: '3D Render' },
  { value: 'pixel-art', label: 'Pixel Art' },
  { value: 'anime', label: 'Anime' },
];

function isImageUrl(value: string) {
  return /^(https?:\/\/|data:image\/|blob:)/i.test(value.trim()) && !/\s/.test(value.trim());
}

function ImageDropzone({
  file,
  onFileChange,
  icon,
  label,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  icon: ElementType;
  label: string;
}) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFileChange(accepted[0]);
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const Icon = icon;

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
        <Icon className="w-6 h-6 text-primary-400" />
      </motion.div>
      <p className="font-medium text-gray-200 break-all">{file ? file.name : label}</p>
      <p className="text-sm text-gray-500 mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}</p>
      <input {...getInputProps()} />
    </div>
  );
}

export default function ImageAIPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [describeFile, setDescribeFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [describing, setDescribing] = useState(false);

  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [captioning, setCaptioning] = useState(false);

  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.generateImage(prompt, style);
      setResult(res.data.description);
    } catch { toast.error('Failed to generate image'); }
    finally { setLoading(false); }
  };

  const describeImage = async () => {
    if (!describeFile) return;
    setDescribing(true);
    const fd = new FormData();
    fd.append('file', describeFile);
    try {
      const res = await aiAPI.describeImage(fd);
      setDescription(res.data.description);
    } catch { toast.error('Failed to describe image'); }
    finally { setDescribing(false); }
  };

  const captionImage = async () => {
    if (!captionFile) return;
    setCaptioning(true);
    const fd = new FormData();
    fd.append('file', captionFile);
    try {
      const res = await aiAPI.captionImage(fd);
      setCaption(res.data.caption);
    } catch { toast.error('Failed to caption image'); }
    finally { setCaptioning(false); }
  };

  const extractOcr = async () => {
    if (!ocrFile) return;
    setOcrLoading(true);
    const fd = new FormData();
    fd.append('file', ocrFile);
    try {
      const res = await aiAPI.ocr(fd);
      setOcrText(res.data.text);
    } catch { toast.error('OCR failed'); }
    finally { setOcrLoading(false); }
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'describe', label: 'Describe', icon: <Image className="w-4 h-4" /> },
    { id: 'caption', label: 'Caption', icon: <Captions className="w-4 h-4" /> },
    { id: 'ocr', label: 'OCR', icon: <ScanText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        icon={<Image className="w-6 h-6 text-white" />}
        title="Image AI"
        subtitle="Generate, describe, caption, and extract text from images"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs tabs={tabs}>
          {(activeTab) => (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {activeTab === 'generate' && (
                <Card gradientBorder className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Describe the image you want to generate..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select options={styles} value={style} onChange={(e) => setStyle(e.target.value)} className="w-full sm:w-48" />
                      <Button onClick={generateImage} loading={loading} className="w-full sm:w-auto sm:px-8">
                        {!loading && <Sparkles className="w-4 h-4" />}
                        Generate
                      </Button>
                    </div>
                    {result && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4">
                          {isImageUrl(result) ? (
                            <img
                              src={result}
                              alt="Generated image"
                              className="w-full rounded-xl border border-white/10 max-h-[480px] object-contain"
                            />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">{result}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'describe' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <ImageDropzone file={describeFile} onFileChange={setDescribeFile} icon={Image} label="Drop an image to describe" />
                    <Button onClick={describeImage} loading={describing} disabled={!describeFile} className="w-full sm:w-auto sm:px-8">
                      {!describing && <Image className="w-4 h-4" />}
                      Describe Image
                    </Button>
                    {description && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4">
                          <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">{description}</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'caption' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <ImageDropzone file={captionFile} onFileChange={setCaptionFile} icon={Type} label="Drop an image to caption" />
                    <Button onClick={captionImage} loading={captioning} disabled={!captionFile} className="w-full sm:w-auto sm:px-8">
                      {!captioning && <Type className="w-4 h-4" />}
                      Generate Caption
                    </Button>
                    {caption && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4">
                          <p className="text-sm text-gray-300 leading-relaxed">{caption}</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'ocr' && (
                <Card className="p-6 sm:p-7">
                  <CardContent className="space-y-4">
                    <ImageDropzone file={ocrFile} onFileChange={setOcrFile} icon={FileText} label="Upload image with text" />
                    <Button onClick={extractOcr} loading={ocrLoading} disabled={!ocrFile} className="w-full sm:w-auto sm:px-8">
                      {!ocrLoading && <ScanText className="w-4 h-4" />}
                      Extract Text
                    </Button>
                    {ocrText && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-4">
                          <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">{ocrText}</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}

              {loading && activeTab === 'generate' && (
                <Card className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-4"
                  >
                    <Loader2 className="w-6 h-6 text-primary-400" />
                  </motion.div>
                  <p className="font-medium text-gray-200">Generating your image...</p>
                  <p className="text-sm text-gray-500 mt-1">Crafting something beautiful with {style.replace(/-/g, ' ')}</p>
                </Card>
              )}
            </motion.div>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
