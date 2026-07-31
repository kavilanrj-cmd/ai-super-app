'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { jobAPI } from '@/lib/api';
import {
  Search, MapPin, Clock, DollarSign, Heart, ExternalLink, Briefcase, Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, EmptyState, Button, Input, SkeletonCard } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchJobs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return toast.error('Enter a search query');
    setLoading(true);
    try {
      const res = await jobAPI.search(query, location || undefined);
      setJobs(res.data);
      setHasSearched(true);
    } catch (err) {
      toast.error('Failed to search jobs');
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId: number) => {
    try {
      await jobAPI.save(jobId);
      toast.success('Job saved!');
    } catch (err) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Briefcase className="w-6 h-6 text-white" />}
        title="Job Finder"
        subtitle="Search and discover opportunities across the web"
        actions={
          jobs.length > 0 && (
            <span className="px-3 py-1 text-xs rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
              {jobs.length} jobs found
            </span>
          )
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-4 sm:p-5">
          <form onSubmit={searchJobs} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-500" />}
                placeholder="Job title, skills, or keywords"
                className="w-full"
              />
            </div>
            <div className="md:w-56">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
                placeholder="Location"
                className="w-full"
              />
            </div>
            <Button type="submit" loading={loading} className="md:self-start shrink-0">
              {!loading && <Search className="w-4 h-4" />}
              Search Jobs
            </Button>
          </form>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-card p-5 group hover:border-primary-500/25 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/15 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-primary-300">
                      {(job.company || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-100">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-500" /> {job.company || 'Unknown'}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" /> {job.location}
                        </span>
                      )}
                    </div>
                    {(job.job_type || job.salary_min) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.job_type && (
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {job.job_type}
                          </span>
                        )}
                        {job.salary_min && (
                          <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" />
                            ${job.salary_min}k - ${job.salary_max}k
                          </span>
                        )}
                      </div>
                    )}
                    {job.description && (
                      <p className="text-sm text-gray-400 mt-2.5 line-clamp-2">{job.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => saveJob(job.id)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all',
                      'bg-white/[0.03] border-white/[0.06] text-gray-400',
                      'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25'
                    )}
                    aria-label="Save job"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  {job.source_url && (
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'p-2.5 rounded-xl border transition-all',
                        'bg-white/[0.03] border-white/[0.06] text-gray-400',
                        'hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/25'
                      )}
                      aria-label="Open job listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-primary-400" />}
            title={hasSearched ? 'No jobs found' : 'Search for jobs to get started'}
            description={
              hasSearched
                ? 'Try adjusting your search terms or location to find more opportunities.'
                : 'Enter a job title, skill, or keyword above to discover opportunities.'
            }
            className="!py-14"
          />
        </div>
      )}
    </div>
  );
}
