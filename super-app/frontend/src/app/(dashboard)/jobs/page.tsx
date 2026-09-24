'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jobAPI, resumeAPI } from '@/lib/api';
import {
  Search, MapPin, Clock, DollarSign, Heart, ExternalLink, Briefcase, Building,
  Globe, ArrowUpRight, RotateCw, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, EmptyState, Button, Input, Select, SkeletonCard, Modal, ModalBody } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  posted_at?: string;
  salary?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  employment_type?: string;
  experience_level?: string;
  remote: boolean;
  work_mode?: string;
  skills: string[];
  logo?: string | null;
}

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  providers: string[];
}

const REMOTE_OPTIONS = [
  { value: 'all', label: 'Any work mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const EXP_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: 'entry', label: 'Entry level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Any job type' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const PROVIDER_META: Record<string, { label: string; cls: string }> = {
  adzuna: { label: 'Adzuna', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/25' },
  remotive: { label: 'Remotive', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  jsearch: { label: 'Job Search API', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
};

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function workModeLabel(mode?: string): string {
  if (mode === 'remote') return 'Remote';
  if (mode === 'hybrid') return 'Hybrid';
  return 'On-site';
}

interface JobListProps {
  jobs: Job[];
  savedIds: Set<number>;
  onSave: (job: Job) => void;
  onOpen: (job: Job) => void;
  meta: SearchMeta | null;
  onLoadMore: () => void;
  loadingMore: boolean;
}

function JobList({ jobs, savedIds, onSave, onOpen, meta, onLoadMore, loadingMore }: JobListProps) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
        <AnimatePresence>
          {jobs.map((job, i) => (
            <motion.div
              key={`${job.id}-${job.url}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min((i % 12) * 0.04, 0.3) }}
              className="glass-card p-5 group hover:border-primary-500/25 transition-all cursor-pointer"
              onClick={() => onOpen(job)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {job.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-primary-300">
                        {(job.company || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-100">{job.title}</h3>
                      {(job.remote || job.work_mode === 'remote') && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Remote
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-500" /> {job.company || 'Unknown'}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" /> {job.location}
                        </span>
                      )}
                      {job.work_mode && job.work_mode !== 'remote' && (
                        <span className="text-xs">· {workModeLabel(job.work_mode)}</span>
                      )}
                    </div>
                    {(job.salary || job.employment_type || job.posted_at) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.employment_type && (
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {job.employment_type}
                          </span>
                        )}
                        {job.salary && (
                          <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {job.salary}
                          </span>
                        )}
                        {job.posted_at && (
                          <span className="px-3 py-1 text-xs rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06]">
                            {timeAgo(job.posted_at)}
                          </span>
                        )}
                      </div>
                    )}
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.skills.slice(0, 6).map((s, si) => (
                          <span key={si} className="px-2 py-0.5 text-[11px] rounded-md bg-primary-500/[0.07] text-primary-300/90 border border-primary-500/10">
                            {s}
                          </span>
                        ))}
                        {job.skills.length > 6 && (
                          <span className="px-2 py-0.5 text-[11px] rounded-md bg-white/[0.05] text-gray-400 border border-white/[0.06]">
                            +{job.skills.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                    {job.description && (
                      <p className="text-sm text-gray-500 mt-2.5 line-clamp-2">{job.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!savedIds.has(job.id)) onSave(job); }}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all',
                        savedIds.has(job.id)
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25'
                      )}
                      aria-label="Save job"
                    >
                      <Heart className={cn('w-4 h-4', savedIds.has(job.id) && 'fill-current')} />
                    </button>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'p-2.5 rounded-xl border transition-all',
                          'bg-white/[0.03] border-white/[0.06] text-gray-400',
                          'hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/25'
                        )}
                        aria-label="Open original job listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-[11px] rounded-full border',
                    PROVIDER_META[job.source?.toLowerCase()]?.cls || 'bg-white/[0.04] text-gray-400 border-white/[0.08]'
                  )}>
                    {PROVIDER_META[job.source?.toLowerCase()]?.label || job.source || 'unknown'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {meta?.has_more && jobs.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} loading={loadingMore} className="min-w-[200px]" disabled={loadingMore}>
            {!loadingMore && <ArrowUpRight className="w-4 h-4" />}
            Load more jobs ({Math.max(meta.total - jobs.length, 0)} more)
          </Button>
        </div>
      )}
    </>
  );
}

interface DetailProps {
  job: Job;
  onClose: () => void;
  onSave: (job: Job) => void;
  saved: boolean;
}

function JobDetailModal({ job, onClose, onSave, saved }: DetailProps) {
  return (
    <Modal open onClose={onClose} title={job.title} size="lg">
      <ModalBody>
        <div className="flex items-center gap-3">
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary-300">{(job.company || '?').charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-100 break-words">{job.title}</p>
            <p className="text-sm text-gray-400">{job.company || 'Unknown'} · {job.location || 'Anywhere'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.employment_type && (
            <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">{job.employment_type}</span>
          )}
          {job.work_mode && (
            <span className="px-3 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">{workModeLabel(job.work_mode)}</span>
          )}
          {job.salary && (
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" /> {job.salary}
            </span>
          )}
          {job.posted_at && (
            <span className="px-3 py-1 text-xs rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06]">
              Posted {timeAgo(job.posted_at)}
            </span>
          )}
          {job.experience_level && (
            <span className="px-3 py-1 text-xs rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25">
              {job.experience_level}
            </span>
          )}
        </div>

        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s, i) => (
              <span key={i} className="px-2 py-1 text-[11px] rounded-md bg-primary-500/[0.07] text-primary-300/90 border border-primary-500/10">
                {s}
              </span>
            ))}
          </div>
        )}

        {job.description && (
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Description</h4>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe className="w-3.5 h-3.5" />
            <span>Listing from</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full border text-[11px]',
              PROVIDER_META[job.source?.toLowerCase()]?.cls || 'bg-white/[0.04] text-gray-400 border-white/[0.08]'
            )}>
              {PROVIDER_META[job.source?.toLowerCase()]?.label || job.source || 'unknown'}
            </span>
            <span>· Opens on the original site</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSave(job)} disabled={saved} className="shrink-0">
              <Heart className={cn('w-4 h-4', saved && 'fill-current text-red-400')} />
              {saved ? 'Saved' : 'Save job'}
            </Button>
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <Button className="shrink-0">
                  <ExternalLink className="w-4 h-4" /> Apply on original site
                </Button>
              </a>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState('all');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [selected, setSelected] = useState<Job | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const buildParams = (page: number) => ({
    query,
    location: location.trim() || undefined,
    remote,
    job_type: jobType || undefined,
    experience_level: experience || undefined,
    salary_min: salaryMin ? Number(salaryMin) : undefined,
    salary_max: salaryMax ? Number(salaryMax) : undefined,
    page,
    limit: 12,
  });

  const runSearch = async (page: number) => {
    setSearchError(null);
    try {
      const res = await jobAPI.search(buildParams(page));
      const data = res.data as { jobs: Job[]; total: number; page: number; limit: number; has_more: boolean; providers: string[] };
      setJobs((prev) => (page === 1 ? data.jobs : [...prev, ...data.jobs]));
      setMeta({
        total: data.total,
        page: data.page,
        limit: data.limit,
        has_more: data.has_more,
        providers: data.providers || [],
      });
      setHasSearched(true);
    } catch (err: any) {
      if (page === 1) {
        setJobs([]);
        setMeta(null);
        setHasSearched(true);
        const detail = err?.response?.data?.detail;
        setSearchError(
          typeof detail === 'string' && detail
            ? detail
            : 'Job search service is currently unavailable. Please try again.'
        );
      } else {
        toast.error('Could not load more jobs.');
      }
    }
  };

  const onSubmit = async () => {
    if (!query.trim()) return toast.error('Enter a job title or skill');
    setLoading(true);
    try {
      await runSearch(1);
    } finally {
      setLoading(false);
    }
  };

  const onLoadMore = async () => {
    if (!meta || !meta.has_more || loadingMore) return;
    setLoadingMore(true);
    try {
      await runSearch(meta.page + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const onResumeSearch = async () => {
    setResumeLoading(true);
    try {
      const res = await resumeAPI.history();
      const items: any[] = res.data || [];
      if (!items.length) {
        toast.error('No resume analysis found. Upload a resume to enable this.');
        return;
      }
      const latest = items[0];
      const prefilled = (latest.title || '').trim();
      if (prefilled) {
        setQuery(prefilled);
        setLocation('');
        setRemote('all');
        setExperience('');
        setJobType('');
        setSalaryMin('');
        setSalaryMax('');
        setLoading(true);
        try {
          await runSearch(1);
          toast.success(`Searching based on your profile: ${prefilled}`);
        } finally {
          setLoading(false);
        }
      } else {
        toast('No job title found in your resume. Fill the search box and press Search Jobs.');
      }
    } catch {
      toast.error('Could not load your resume data.');
    } finally {
      setResumeLoading(false);
    }
  };

  const saveJob = async (job: Job) => {
    try {
      await jobAPI.save(job.id);
      setSavedIds((prev) => new Set(prev).add(job.id));
      toast.success('Job saved!');
    } catch {
      toast.error('Failed to save job');
    }
  };

  const providerBadges = (meta?.providers || [])
    .filter((p) => PROVIDER_META[p.toLowerCase()])
    .map((p) => PROVIDER_META[p.toLowerCase()]);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Briefcase className="w-6 h-6 text-white" />}
        title="Job Finder"
        subtitle="Search and discover real opportunities from live job boards across the web"
        actions={
          jobs.length > 0 && meta ? (
            <span className="px-3 py-1 text-xs rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
              {jobs.length} of {meta.total} jobs
            </span>
          ) : undefined
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass-card p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                icon={<Search className="w-4 h-4 text-gray-500" />}
                placeholder="Job title, skill, or keywords"
                className="w-full"
              />
            </div>
            <div className="lg:col-span-3">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
                placeholder="Location (e.g. Chennai)"
                className="w-full"
              />
            </div>
            <div className="lg:col-span-4 grid grid-cols-3 gap-3">
              <Select value={remote} onChange={(e) => setRemote(e.target.value)} options={REMOTE_OPTIONS} />
              <Select value={experience} onChange={(e) => setExperience(e.target.value)} options={EXP_OPTIONS} />
              <Select value={jobType} onChange={(e) => setJobType(e.target.value)} options={TYPE_OPTIONS} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <DollarSign className="w-3.5 h-3.5" />
              <input
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Min salary"
                className="input-field w-24 px-2.5 py-1.5 text-xs"
              />
              <span>-</span>
              <input
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Max salary"
                className="input-field w-24 px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={onResumeSearch} loading={resumeLoading} className="shrink-0">
                {!resumeLoading && <GraduationCap className="w-4 h-4" />}
                Search from my resume
              </Button>
              <Button onClick={onSubmit} loading={loading} className="shrink-0">
                {!loading && <Search className="w-4 h-4" />}
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {providerBadges.length > 0 && !loading && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Globe className="w-3.5 h-3.5" />
          <span>Showing live listings from:</span>
          {providerBadges.map((b, i) => (
            <span key={i} className={cn('px-2 py-0.5 rounded-full border text-[11px]', b.cls)}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary-400 animate-pulse" /> Searching real job boards...
          </p>
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      ) : searchError ? (
        <div className="glass-card">
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-amber-400" />}
            title="Unable to fetch jobs right now"
            description={searchError}
            action={
              <Button variant="outline" onClick={onSubmit}>
                <RotateCw className="w-4 h-4" /> Try again
              </Button>
            }
            className="!py-14"
          />
        </div>
      ) : jobs.length > 0 ? (
        <JobList
          jobs={jobs}
          savedIds={savedIds}
          onSave={saveJob}
          onOpen={setSelected}
          meta={meta}
          onLoadMore={onLoadMore}
          loadingMore={loadingMore}
        />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-primary-400" />}
            title={hasSearched ? 'No jobs found for this search.' : 'Search for jobs to get started'}
            description={
              hasSearched
                ? 'Try different keywords, another location, or widen your filters.'
                : 'Enter a job title, skill, or keyword above to discover real opportunities.'
            }
            className="!py-14"
          />
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <JobDetailModal
            job={selected}
            onClose={() => setSelected(null)}
            onSave={saveJob}
            saved={savedIds.has(selected.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}