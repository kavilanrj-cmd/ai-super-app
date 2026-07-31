'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Markdown, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { PenTool, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const contentTypes = [
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'linkedin-post', label: 'LinkedIn Post' },
  { value: 'instagram-caption', label: 'Instagram Caption' },
  { value: 'tweet', label: 'Tweet / X Post' },
  { value: 'facebook-post', label: 'Facebook Post' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'social-media-bio', label: 'Social Media Bio' },
  { value: 'press-release', label: 'Press Release' },
];

export default function WritingAssistantPage() {
  const [contentType, setContentType] = useState('blog-post');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.generateWriting(contentType, topic, tone, keywords, length);
      setGeneratedContent(res.data.content);
      toast.success('Content generated');
    } catch { toast.error('Failed to generate content'); }
    finally { setLoading(false); }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        icon={<PenTool className="w-6 h-6 text-white" />}
        title="AI Writing Assistant"
        subtitle="Generate blogs, articles, social media posts, and more"
        gradient="from-pink-500 to-rose-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradientBorder className="p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">Content Details</h3>
                <p className="text-xs text-gray-500">Describe what you want to write</p>
              </div>
            </div>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select label="Content Type" options={contentTypes} value={contentType} onChange={(e) => setContentType(e.target.value)} />
                <Select label="Tone" options={[
                  { value: 'professional', label: 'Professional' },
                  { value: 'casual', label: 'Casual' },
                  { value: 'humorous', label: 'Humorous' },
                  { value: 'inspirational', label: 'Inspirational' },
                  { value: 'formal', label: 'Formal' },
                  { value: 'conversational', label: 'Conversational' },
                  { value: 'persuasive', label: 'Persuasive' },
                ]} value={tone} onChange={(e) => setTone(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Topic / Title" placeholder="What is this about?" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <Select label="Length" options={[
                  { value: 'short', label: 'Short (~100 words)' },
                  { value: 'medium', label: 'Medium (~300 words)' },
                  { value: 'long', label: 'Long (~600 words)' },
                  { value: 'comprehensive', label: 'Comprehensive (~1000 words)' },
                ]} value={length} onChange={(e) => setLength(e.target.value)} />
              </div>

              <Input label="Keywords (optional)" placeholder="SEO keywords, comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

              <Button onClick={generateContent} loading={loading} variant="gradient" className="w-full">
                <Sparkles className="w-4 h-4" /> Generate {contentTypes.find((c) => c.value === contentType)?.label || 'Content'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {generatedContent ? (
            <Card className="p-6 sm:p-7 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <CardTitle className="text-base">Generated Content</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={copyText}>
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black/30 border border-white/[0.06] rounded-xl p-5 max-h-[560px] overflow-y-auto">
                  <Markdown content={generatedContent} />
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
              <p className="font-medium text-gray-200">Writing your content...</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs">The AI is drafting with your chosen tone and length.</p>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col justify-center min-h-[420px]">
              <EmptyState
                icon={<PenTool className="w-6 h-6 text-primary-400" />}
                title="Your content will appear here"
                description="Describe your topic and generate AI-written content."
                className="!py-0"
              />
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
