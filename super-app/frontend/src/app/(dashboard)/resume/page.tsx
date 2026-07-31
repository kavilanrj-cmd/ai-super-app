'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '@/lib/api';
import {
  Upload, FileText, Target, Lightbulb,
  ListChecks, Download, RefreshCw, Sparkles,
  Eye, Briefcase, GraduationCap, Award, FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, CircularProgress, SkeletonCard } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const analyzeResume = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await resumeAPI.analyze(formData);
      setResult(res.data);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const score = Math.min(result?.ats_score || 0, 100);

  const suggestionCards = [
    { icon: Eye, label: 'Experience', value: result?.experience_years, color: 'text-blue-400 bg-blue-500/10' },
    { icon: GraduationCap, label: 'Education', value: result?.education?.level || result?.highest_degree, color: 'text-purple-400 bg-purple-500/10' },
    { icon: Award, label: 'Certifications', value: result?.certifications?.length, color: 'text-amber-400 bg-amber-500/10' },
    { icon: Briefcase, label: 'Jobs Match', value: result?.job_titles?.length, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<FileCheck2 className="w-6 h-6 text-white" />}
        title="Resume Analyzer"
        subtitle="Upload your resume for AI-powered ATS analysis and actionable insights"
        actions={result && (
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume-analysis.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div
            {...getRootProps()}
            className={cn(
              'group relative overflow-hidden glass-card p-10 sm:p-14 text-center cursor-pointer transition-all border-2 border-dashed',
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
              className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-primary-500/15 to-fuchsia-500/15 border border-primary-500/25 flex items-center justify-center mb-5 shadow-glow-sm"
            >
              <Upload className="w-7 h-7 text-primary-400" />
            </motion.div>
            {file ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-medium text-gray-200 break-all">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mt-2">
                  <FileCheck2 className="w-3 h-3" /> Ready to analyze
                </span>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-200 mb-1.5">Drop your resume here</p>
                <p className="text-sm text-gray-500">or click to browse · Supports PDF</p>
              </div>
            )}
          </div>

          {file && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={analyzeResume}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Analyze Resume
                </>
              )}
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {suggestionCards.map((c) => (
              <div key={c.label} className="glass-card !rounded-xl p-4 flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', c.color)}>
                  <c.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-100 text-lg truncate">
                    {loading ? '…' : c.value ?? '—'}
                  </p>
                  <p className="text-[11px] text-gray-500">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} className="!p-6" />)}
          </div>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 sm:p-7 flex items-center gap-6">
              <div className="shrink-0">
                <CircularProgress
                  value={score}
                  size={128}
                  strokeWidth={10}
                  label=""
                  sublabel="ATS Score"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="font-medium text-gray-200">Overall Score</p>
                </div>
                <p className="text-3xl font-bold gradient-text leading-none">
                  {score.toFixed(0)}
                  <span className="text-sm text-gray-500 font-normal"> /100</span>
                </p>
                <p className="text-xs text-gray-500 max-w-[180px]">
                  {score >= 80 ? 'Excellent! Recruiter-ready.' : score >= 60 ? 'Good, room to improve.' : 'Needs improvement for ATS.'}
                </p>
              </div>
            </div>

            {result.skills_found && result.skills_found.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="font-semibold text-gray-200">Skills Found</h3>
                  <span className="ml-auto text-xs text-gray-500">{result.skills_found.length} detected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills_found.map((skill: string, i: number) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="font-semibold text-gray-200">AI Analysis</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-gray">
                <p className="text-gray-300 whitespace-pre-wrap">{result.analysis}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-fuchsia-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-primary-400" />
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Upload a resume and see your <span className="text-primary-400 font-medium">ATS score</span>, detected skills and AI-powered improvement tips.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
