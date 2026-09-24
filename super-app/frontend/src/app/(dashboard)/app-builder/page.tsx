'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Loader2, Sparkles, FileCode2, FolderOpen, File as FileIcon,
  RefreshCw, ExternalLink, Square, RotateCcw, TerminalSquare,
  CircleDot, ChevronDown, ChevronRight, Boxes, Cpu, WifiOff,
  MessageCircle, Files, PlayCircle, Hammer, MonitorPlay,
  Plus, Pencil, Copy, Trash2, History, CalendarDays, Wrench, FolderPlus,
  Download,
} from 'lucide-react';
import { appBuilderAPI } from '@/lib/api';
import { Markdown, Modal, ModalContent, ModalFooter, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type Status = {
  ok: boolean;
  provider?: string;
  base_url?: string;
  model?: string;
  models_installed?: string[];
  model_ready?: boolean;
  message?: string;
};

type Message = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  meta?: string;
  tone?: 'ok' | 'err' | 'info';
};

type ProjectFile = { path: string; size?: number };

type ProjectMeta = {
  project_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  build_success?: boolean;
  preview_running?: boolean;
  files_count?: number;
};

type ModalKind = 'open' | 'rename' | 'duplicate' | 'delete' | null;

type Pipeline = 'idle' | 'planning' | 'installing' | 'building' | 'repairing' | 'starting' | 'ready' | 'error';

const TEMPLATES: { label: string; prompt: string }[] = [
  { label: 'Portfolio', prompt: 'Create a modern portfolio website for a developer. Include a hero, about, skills, projects, experience, and contact sections. Use a dark futuristic design with purple/cyan accents.' },
  { label: 'SaaS', prompt: 'Create a modern SaaS landing page with hero, features, pricing plans, testimonials, FAQ, and a signup CTA. Clean, premium design.' },
  { label: 'Landing Page', prompt: 'Create a striking landing page with a big hero, a features grid, and a strong call-to-action section. Add a sticky navbar.' },
  { label: 'Dashboard', prompt: 'Create an admin dashboard web app with a sidebar, stat cards at the top, a chart section, a data table, and a dark theme.' },
  { label: 'E-commerce', prompt: 'Create an e-commerce storefront with a hero banner, a product grid with prices, product cards, and a modern catalog layout.' },
  { label: 'Blog', prompt: 'Create a clean blog website with a grid of article cards, a featured post, tag filters, and a newsletter signup box.' },
  { label: 'Job Portal', prompt: 'Create a job portal homepage with a hero search bar, featured job listing cards, job categories, and a stats strip.' },
  { label: 'AI Chat App', prompt: 'Create an AI chat interface app with a message list, an input bar, suggested prompt chips, and a gradient theme.' },
];

function extFor(path: string) {
  const m = /\.([a-z0-9]+)$/i.exec(path);
  return m ? m[1].toLowerCase() : path.split('/').at(-1)?.includes('.') ? '' : 'txt';
}

function buildTree(files: ProjectFile[]) {
  const dirs = new Map<string, { files: string[]; dirs: Set<string> }>();
  const root: string[] = [];
  const all = new Set<string>();
  files.forEach((f) => {
    const parts = f.path.split('/');
    if (parts.length === 1) {
      root.push(f.path);
      all.add(f.path);
    } else {
      const top = parts[0];
      if (!dirs.has(top)) dirs.set(top, { files: [], dirs: new Set() });
      const node = dirs.get(top)!;
      if (parts.length === 2) node.files.push(f.path);
      else node.dirs.add(parts[1]);
      all.add(top);
    }
  });
  root.sort();
  return {
    root,
    dirs: Array.from(dirs.entries())
      .map(([name, node]) => ({ name, files: node.files.sort(), subdirs: Array.from(node.dirs).sort() }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    all,
  };
}

const STEP_LABELS: Record<string, { label: string; icon: any }> = {
  planning: { label: 'Planning & writing your app with local AI', icon: Sparkles },
  installing: { label: 'Installing dependencies', icon: Boxes },
  building: { label: 'Building the project', icon: Hammer },
  repairing: { label: 'AI is fixing build errors', icon: Cpu },
  starting: { label: 'Starting live preview', icon: PlayCircle },
};

const PIPELINE_STEPS = ['planning', 'installing', 'building', 'starting'];

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AppBuilderPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [meta, setMeta] = useState<ProjectMeta | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['components', 'app']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [pipeline, setPipeline] = useState<Pipeline>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [projectList, setProjectList] = useState<ProjectMeta[]>([]);
  const [lastErrors, setLastErrors] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [nameDraft, setNameDraft] = useState('');
  const msgId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const addMessage = useCallback((role: 'user' | 'ai', text: string, meta?: string, tone?: 'ok' | 'err' | 'info') => {
    msgId.current += 1;
    setMessages((prev) => [...prev, { id: msgId.current, role, text, meta, tone }]);
  }, []);

  const setStep = useCallback((s: Pipeline) => {
    setPipeline(s);
    if (s !== 'idle') setShowWelcome(false);
  }, []);

  const currentSteps = useMemo(() => {
    if (pipeline === 'repairing') return [...PIPELINE_STEPS.slice(0, 2), 'repairing', 'starting'];
    return PIPELINE_STEPS;
  }, [pipeline]);

  const activeStepIndex = currentSteps.findIndex((s) => s === pipeline);
  const busy =
    pipeline === 'planning' ||
    pipeline === 'installing' ||
    pipeline === 'building' ||
    pipeline === 'repairing' ||
    pipeline === 'starting';

  const refreshProjects = useCallback(async (targetId?: string) => {
    try {
      const res = await appBuilderAPI.projects();
      const list: ProjectMeta[] = res.data.projects || [];
      setProjectList(list);
      if (targetId) {
        const cur = list.find((p) => p.project_id === targetId);
        if (cur) setMeta(cur);
      }
    } catch {
      setProjectList([]);
    }
  }, []);

  useEffect(() => {
    appBuilderAPI
      .status()
      .then((res) => setStatus(res.data))
      .catch(() => setStatus({ ok: false, message: 'Ollama is not running. Start Ollama to use local AI App Builder.' }))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('prompt');
    if (p) setPrompt(p);
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [...prev, line]);
  }, []);

  const ollamaUnavailable = !checking && status && !status.ok;

  const pickTemplate = (t: string) => {
    setPrompt(t);
  };

  const runBuild = useCallback(
    async (pid: string) => {
      setStep('installing');
      setLastErrors(null);
      pushLog('$ npm install --no-audit --no-fund');
      const buildRes = await appBuilderAPI.build(pid);
      pushLog(buildRes.data.log || '');
      await refreshProjects(pid);
      if (!buildRes.data.success) {
        setStep('error');
        setLastErrors(buildRes.data.errors || '');
        const short = (buildRes.data.errors || 'Build failed.').split('\n').slice(0, 18).join('\n');
        addMessage(
          'ai',
          'Build failed after the automatic repair attempts. The full error log is below.',
          short,
          'err'
        );
        return { ok: false as const };
      }
      addMessage(
        'ai',
        'Build succeeded.',
        `Compiled cleanly in ${buildRes.data.attempts} attempt${buildRes.data.attempts > 1 ? 's' : ''}.`,
        'ok'
      );
      return { ok: true as const };
    },
    [addMessage, pushLog, setStep, refreshProjects]
  );

  const startPreview = useCallback(
    async (pid: string) => {
      setStep('starting');
      pushLog('$ npm run start (preview server)');
      const res = await appBuilderAPI.previewStart(pid);
      setPreviewUrl(res.data.preview_url);
      setPreviewKey((k) => k + 1);
      setStep('ready');
      await refreshProjects(pid);
      return res.data.preview_url as string;
    },
    [pushLog, setStep, refreshProjects]
  );

  const refreshFiles = useCallback(async (pid: string) => {
    try {
      const res = await appBuilderAPI.files(pid);
      setFiles(res.data.files || []);
    } catch {
      setFiles([]);
    }
  }, []);

  const loadFile = useCallback(
    async (path: string) => {
      if (!projectId) return;
      setSelectedFile(path);
      setLoadingFile(true);
      try {
        const res = await appBuilderAPI.file(projectId, path);
        setFileContent(res.data.content);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Could not read file');
        setFileContent(null);
      } finally {
        setLoadingFile(false);
      }
    },
    [projectId]
  );

  const generate = useCallback(async () => {
    if (!prompt.trim() || pipeline === 'planning' || pipeline === 'installing' || pipeline === 'building') return;
    const text = prompt.trim();
    addMessage('user', text);
    setPrompt('');
    setStep('planning');
    pushLog('> Generating app from your description...');
    setPipeline('planning');
    try {
      const res = await appBuilderAPI.generate(text);
      const data = res.data;
      setProjectId(data.project_id);
      setProjectName(data.name);
      addMessage(
        'ai',
        `Generated "${data.name}"`,
        `${data.written.length} files written. Files: ${data.written.map((w: any) => w.path).join(', ')}`,
        'ok'
      );
      pushLog(`$ project ${data.project_id} created (${data.written.length} files)`);
      await refreshFiles(data.project_id);
      await refreshProjects(data.project_id);
      const built = await runBuild(data.project_id);
      if (built.ok) {
        await startPreview(data.project_id);
      }
    } catch (err: any) {
      setStep('error');
      const detail = err?.response?.data?.detail;
      const msg = detail?.includes('Ollama')
        ? detail
        : detail || 'Generation failed. Check that Ollama is running and the model is pulled.';
      addMessage('ai', msg, undefined, 'err');
      pushLog(`! ${msg}`);
    }
  }, [prompt, pipeline, addMessage, setStep, pushLog, runBuild, startPreview, refreshFiles, refreshProjects]);

  const iterate = useCallback(async () => {
    if (!projectId || !prompt.trim() || pipeline === 'planning' || pipeline === 'installing' || pipeline === 'building') return;
    const text = prompt.trim();
    addMessage('user', text);
    setPrompt('');
    setStep('planning');
    pushLog('> Modifying existing project...');
    try {
      const res = await appBuilderAPI.iterate(projectId, text);
      addMessage('ai', res.data.message || 'Change applied.', `${res.data.written.length} file(s) updated`, 'ok');
      await refreshFiles(projectId);
      await refreshProjects(projectId);
      const built = await runBuild(projectId);
      if (built.ok) {
        await startPreview(projectId);
      }
    } catch (err: any) {
      setStep('error');
      addMessage('ai', err?.response?.data?.detail || 'Modification failed.', undefined, 'err');
      pushLog(`! ${err?.response?.data?.detail || 'modify failed'}`);
    }
  }, [projectId, prompt, pipeline, addMessage, setStep, pushLog, runBuild, startPreview, refreshFiles, refreshProjects]);

  const handleSubmit = () => {
    if (projectId) iterate();
    else generate();
  };

  const repair = useCallback(async () => {
    if (!projectId || busy || !lastErrors) return;
    setStep('repairing');
    pushLog('> Asking AI to fix the build errors...');
    try {
      const res = await appBuilderAPI.repair(projectId, lastErrors);
      pushLog(res.data.log || '');
      await refreshProjects(projectId);
      if (res.data.success) {
        setLastErrors(null);
        addMessage('ai', 'AI fixed the build.', `Compiled cleanly in ${res.data.attempts} attempt${res.data.attempts > 1 ? 's' : ''}.`, 'ok');
        await refreshFiles(projectId);
        await startPreview(projectId);
      } else {
        setLastErrors(res.data.errors || lastErrors);
        setStep('error');
        addMessage('ai', 'Still failing after the AI fix.', (res.data.errors || '').split('\n').slice(0, 18).join('\n'), 'err');
      }
    } catch (err: any) {
      setStep('error');
      const detail = err?.response?.data?.detail || err?.message || 'AI fix failed.';
      addMessage('ai', 'AI fix failed.', detail, 'err');
      pushLog(`! ${detail}`);
    }
  }, [projectId, busy, lastErrors, addMessage, pushLog, setStep, startPreview, refreshFiles, refreshProjects]);

  const stopPreview = useCallback(async () => {
    if (!projectId) return;
    try {
      await appBuilderAPI.previewStop(projectId);
      setPreviewUrl(null);
      toast.success('Preview stopped');
      await refreshProjects(projectId);
    } catch {
      toast.error('Could not stop preview');
    }
  }, [projectId, refreshProjects]);

  const restartPreview = useCallback(async () => {
    if (!projectId) return;
    setStep('starting');
    try {
      const res = await appBuilderAPI.previewRestart(projectId);
      setPreviewUrl(res.data.preview_url);
      setPreviewKey((k) => k + 1);
      setStep('ready');
      toast.success('Preview restarted');
    } catch (err: any) {
      setStep('error');
      toast.error(err?.response?.data?.detail || 'Restart failed');
    }
  }, [projectId, setStep]);

  const refreshPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const openNewTab = useCallback(() => {
    if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }, [previewUrl]);

  const newProject = useCallback(async () => {
    if (previewUrl && projectId) {
      try {
        await appBuilderAPI.previewStop(projectId);
      } catch {
        /* ignore */
      }
    }
    setProjectId(null);
    setProjectName('');
    setMeta(null);
    setFiles([]);
    setMessages([]);
    setLog([]);
    setLastErrors(null);
    setSelectedFile(null);
    setFileContent(null);
    setPreviewUrl(null);
    setPipeline('idle');
    setShowWelcome(true);
    setPrompt('');
  }, [previewUrl, projectId]);

  const openProject = useCallback(
    async (p: ProjectMeta) => {
      if (p.project_id === projectId) return;
      if (previewUrl && projectId) {
        try {
          await appBuilderAPI.previewStop(projectId);
        } catch {
          /* ignore */
        }
      }
      setProjectId(p.project_id);
      setProjectName(p.name);
      setMeta(p);
      setMessages([]);
      setLog([]);
      setLastErrors(null);
      setSelectedFile(null);
      setFileContent(null);
      setPreviewUrl(null);
      setPipeline('idle');
      setPrompt('');
      await refreshFiles(p.project_id);
      addMessage('ai', `Opened "${p.name}".`, `Project ${p.project_id} · ${p.files_count ?? 0} files.`, 'info');
      if (p.build_success) {
        try {
          const res = await appBuilderAPI.previewStart(p.project_id);
          setPreviewUrl(res.data.preview_url);
          setPreviewKey((k) => k + 1);
          setStep('ready');
        } catch {
          addMessage('ai', 'Preview could not start yet — rebuild it and try again.', undefined, 'err');
        }
      } else {
        addMessage('ai', 'This project has not built yet. Type a change and press Build App, or press "Run Build" after opening.', undefined, 'info');
      }
      await refreshProjects(p.project_id);
    },
    [projectId, previewUrl, addMessage, refreshProjects, refreshFiles, setStep]
  );

  const doRename = useCallback(async () => {
    if (!projectId) return;
    const name = nameDraft.trim();
    if (!name) {
      toast.error('Please enter a name');
      return;
    }
    try {
      const res = await appBuilderAPI.rename(projectId, name);
      setProjectName(res.data.name);
      setModal(null);
      toast.success('Project renamed');
      await refreshProjects(projectId);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Rename failed');
    }
  }, [projectId, nameDraft, refreshProjects]);

  const doDuplicate = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await appBuilderAPI.duplicate(projectId, nameDraft.trim() || undefined);
      setModal(null);
      toast.success(`Duplicated as "${res.data.name}"`);
      await refreshProjects();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Duplicate failed');
    }
  }, [projectId, nameDraft, refreshProjects]);

  const doDownload = useCallback(async () => {
    if (!projectId || downloading) return;
    setDownloading(true);
    try {
      const res = await appBuilderAPI.download(projectId);
      const cd = res.headers?.['content-disposition'] || '';
      const match = /filename="?([^";]+)"?/.exec(cd);
      const filename = match?.[1] || `${(projectName || 'generated-app').replace(/[^a-zA-Z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '') || 'generated-app'}.zip`;
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Project downloaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Download failed');
    } finally {
      setDownloading(false);
    }
  }, [projectId, projectName, downloading]);

  const doDelete = useCallback(async () => {
    if (!projectId) return;
    try {
      if (previewUrl) {
        try {
          await appBuilderAPI.previewStop(projectId);
        } catch {
          /* ignore */
        }
      }
      await appBuilderAPI.deleteProject(projectId);
      setModal(null);
      toast.success('Project deleted');
      await newProject();
      await refreshProjects();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Delete failed');
    }
  }, [projectId, previewUrl, newProject, refreshProjects]);

  const toggleDir = (name: string, dir: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const key = `${name}/${dir}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tree = useMemo(() => buildTree(files), [files]);

  const modalTitle = modal === 'open' ? 'Open a project' : modal === 'rename' ? 'Rename project' : modal === 'duplicate' ? 'Duplicate project' : modal === 'delete' ? 'Delete project' : '';

  return (
    <div className="ab-root flex flex-col">
      {/* Header bar */}
      <div className="ab-header flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="ab-logo relative shrink-0">
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-cyan-400 opacity-40 blur-[8px] animate-pulse-slow" />
            <span className="relative flex w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-cyan-400 items-center justify-center text-white shadow-glow">
              <Rocket className="w-5 h-5" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="page-title text-[var(--text-primary)] truncate">AI App Builder</h1>
              {projectName && (
                <span className="ab-project-chip hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 border border-cyan-400/30 bg-cyan-500/10 rounded-full px-2 py-0.5 truncate max-w-[200px]">
                  <Rocket className="w-3 h-3" />
                  {projectName}
                </span>
              )}
            </div>
            <p className="text-[var(--text-secondary)]">Build websites and apps with local AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Project management */}
          <div className="ab-project-menu">
            <button onClick={() => { newProject(); }} className="ab-pm-btn" title="Start a brand-new project">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={() => setModal('open')} className="ab-pm-btn" title="Open an existing project">
              <FolderOpen className="w-3.5 h-3.5" /> Open
            </button>
            {projectId && (
              <>
                <button
                  onClick={() => { setNameDraft(projectName); setModal('rename'); }}
                  className="ab-pm-btn"
                  title="Rename project"
                >
                  <Pencil className="w-3.5 h-3.5" /> Rename
                </button>
                <button
                  onClick={() => { setNameDraft(`${projectName} (copy)`); setModal('duplicate'); }}
                  className="ab-pm-btn"
                  title="Duplicate project"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button
                  onClick={doDownload}
                  disabled={downloading || files.length === 0}
                  className="ab-pm-btn disabled:opacity-60 disabled:cursor-not-allowed"
                  title={files.length === 0 ? 'No files to download yet' : 'Download the complete generated project as a ZIP file'}
                >
                  {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download
                </button>
                <button onClick={() => setModal('delete')} className="ab-pm-btn is-danger" title="Delete project">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </>
            )}
          </div>

          {/* Model status chip */}
          {checking ? (
            <span className="ab-status-chip border-white/15 text-white/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking local AI...
            </span>
          ) : status?.ok ? (
            <span
              className={cn(
                'ab-status-chip',
                status.model_ready
                  ? 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10'
                  : 'border-amber-400/30 text-amber-300 bg-amber-500/10'
              )}
              title={status.message}
            >
              <CircleDot className={cn('w-3.5 h-3.5', status.model_ready ? 'animate-pulse' : '')} />
              {status.model_ready ? 'Local AI ready' : 'Model not pulled'}
              <span className="opacity-80 font-mono text-[11px]">· {status.model}</span>
            </span>
          ) : (
            <span className="ab-status-chip border-red-400/40 text-red-300 bg-red-500/10" title={status?.message}>
              <WifiOff className="w-3.5 h-3.5" />
              Ollama is not running
            </span>
          )}

          {projectId && (
            <button onClick={stopPreview} disabled={!previewUrl} className="ab-mini-btn disabled:opacity-40" title="Stop preview">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Project meta row */}
      {meta && (
        <div className="ab-meta-row mt-3">
          <span className="ab-meta-chip" title="Created">
            <CalendarDays className="w-3 h-3" /> created {formatDate(meta.created_at)}
          </span>
          <span className="ab-meta-chip" title="Last modified">
            <History className="w-3 h-3" /> modified {formatDate(meta.updated_at || meta.created_at)}
          </span>
          <span className={cn('ab-meta-chip', (meta.build_success && 'is-ok') || (pipeline === 'error' && 'is-err'))}>
            {meta.build_success ? 'Build OK' : pipeline === 'error' ? 'Build failed' : 'Not built yet'}
          </span>
          <span className={cn('ab-meta-chip', previewUrl && 'is-live')}>
            {previewUrl ? 'Preview live' : 'Preview stopped'}
          </span>
          {meta.files_count != null && (
            <span className="ab-meta-chip">
              <Files className="w-3 h-3" /> {meta.files_count} files
            </span>
          )}
        </div>
      )}

      {/* Ollama unavailable banner */}
      <AnimatePresence>
        {ollamaUnavailable && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ab-ollama-banner mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border border-red-400/25 bg-red-500/[0.06] px-4 py-3">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-red-500/15 border border-red-400/30 flex items-center justify-center text-red-300">
                <WifiOff className="w-4.5 h-4.5" />
              </span>
              <div className="min-w-0 text-[13px] text-gray-300 leading-relaxed">
                <p className="font-semibold text-red-200">Ollama is not running. Start Ollama to use local AI App Builder.</p>
                <p className="text-gray-400 mt-1">
                  {status?.message ||
                    '1) Install & start Ollama from https://ollama.com · 2) Pull a coding model (e.g. `ollama pull qwen2.5-coder:7b`) · 3) Set OLLAMA_MODEL in .env to match the model you pulled.'}
                </p>
              </div>
              <button
                onClick={() => appBuilderAPI.status().then((r) => setStatus(r.data)).catch(() => {})}
                className="ab-mini-btn shrink-0 ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-check
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace grid — 3 columns: chat / preview / files-build */}
      <div className="ab-grid mt-4">
        {/* LEFT: chat */}
        <div className="ab-col ab-col-chat">
          <div className="ab-panel ab-composer">
            <label className="ab-panel-label">
              <MessageCircle className="w-3.5 h-3.5 text-primary-300" />
              {projectId ? 'Continue building — ask for changes' : 'Describe your app'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              placeholder={
                projectId
                  ? 'e.g. Make the hero section purple, add a pricing section, make the navbar sticky...'
                  : 'e.g. Create a modern portfolio website for an AI developer...'
              }
              rows={3}
              className="ab-input w-full"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {projectId ? (
                  <span className="ab-hint-chip">
                    <MessageCircle className="w-3 h-3" /> iterative edit
                  </span>
                ) : (
                  <span className="ab-hint-chip">
                    <Sparkles className="w-3 h-3" /> local Ollama · no API token
                  </span>
                )}
                <span className="ab-kbd-mini hidden sm:inline">Ctrl+Enter</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || busy}
                className={cn(
                  'ab-build-btn',
                  pipeline === 'error' && 'ab-build-btn-error'
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Working...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {projectId ? 'Apply Change' : 'Build App'}
                  </>
                )}
              </button>
            </div>

            {!projectId && (
              <div className="mt-3">
                <p className="ab-panel-label mb-2">
                  <Files className="w-3.5 h-3.5 text-cyan-300" /> Quick templates
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES.map((t) => (
                    <button key={t.label} onClick={() => pickTemplate(t.prompt)} className="ab-template-chip">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ab-panel ab-convo min-h-0 flex flex-col">
            <div className="ab-panel-label shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-primary-300" /> Conversation
            </div>
            <div className="ab-convo-scroll flex-1 overflow-y-auto scrollbar-thin pr-1">
              {messages.length === 0 ? (
                <div className="ab-empty h-full flex flex-col items-center justify-center text-center py-6">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/15 to-cyan-400/15 border border-primary-500/25 flex items-center justify-center mb-3"
                  >
                    <Sparkles className="w-6 h-6 text-primary-300" />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-200">Build anything with AI</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[240px] leading-relaxed">
                    Describe an app and watch it come to life on the live preview.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('mb-3', m.role === 'user' ? 'text-right' : 'text-left')}
                  >
                    <div
                      className={cn(
                        'inline-block max-w-[92%] text-left rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                        m.role === 'user'
                          ? 'bg-primary-500/15 border border-primary-400/30 text-gray-100'
                          : 'bg-white/[0.04] border border-white/10 text-gray-200'
                      )}
                    >
                      {m.text}
                      {m.meta && (
                        <pre
                          className={cn(
                            'mt-2 whitespace-pre-wrap rounded-xl p-2.5 text-[11px] font-mono border overflow-x-auto',
                            m.tone === 'err'
                              ? 'bg-red-500/10 border-red-400/20 text-red-200'
                              : m.tone === 'ok'
                                ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200'
                                : 'bg-black/30 border-white/10 text-cyan-100'
                          )}
                        >
                          {m.meta}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {busy && (
                <div className="flex items-center gap-2 text-[12px] text-primary-300 pl-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {STEP_LABELS[pipeline]?.label || 'Working...'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: live preview */}
        <div className="ab-col ab-col-preview">
          <div className="ab-right ab-panel flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 shrink-0">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
                <span className="relative flex h-2.5 w-2.5">
                  {previewUrl && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', previewUrl ? 'bg-emerald-400' : 'bg-white/25')} />
                </span>
                LIVE PREVIEW
              </span>
              <span className="text-[11px] text-gray-400 hidden sm:inline truncate max-w-[180px]" title={previewUrl || undefined}>
                {previewUrl || 'not started'}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={refreshPreview} disabled={!previewUrl} className="ab-mini-btn disabled:opacity-40" title="Refresh preview">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={openNewTab} disabled={!previewUrl} className="ab-mini-btn disabled:opacity-40" title="Open in new tab">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={stopPreview} disabled={!previewUrl || busy} className="ab-mini-btn disabled:opacity-40" title="Stop preview">
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button onClick={restartPreview} disabled={!projectId || busy} className="ab-mini-btn disabled:opacity-40" title="Restart preview">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="ab-preview relative flex-1 min-h-0 bg-[#07070f]">
              <AnimatePresence>
                {(pipeline === 'starting' || (!previewUrl && busy) || (pipeline === 'planning' && !previewUrl)) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 ab-preview-loader flex flex-col items-center justify-center gap-3 text-center px-6"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                        className="w-16 h-16 rounded-3xl border-2 border-dashed border-primary-400/50 flex items-center justify-center"
                      >
                        <Rocket className="w-6 h-6 text-primary-300" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute -inset-1 rounded-3xl bg-primary-500/20 blur-xl -z-10"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-200">{STEP_LABELS[pipeline]?.label || 'Preparing preview...'}</p>
                    <div className="flex items-center gap-1.5">
                      {currentSteps.map((s, i) => (
                        <span
                          key={s}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            i <= activeStepIndex ? 'w-8 bg-primary-400' : 'w-4 bg-white/15'
                          )}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {previewUrl ? (
                <iframe
                  key={previewKey}
                  title="AI generated app preview"
                  src={`${previewUrl}?t=${previewKey}`}
                  className="ab-iframe w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="eager"
                />
              ) : (
                !busy && (
                  <div className="ab-preview-empty absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500/10 to-cyan-400/10 border border-white/10 flex items-center justify-center">
                      <MonitorPlay className="w-7 h-7 text-white/25" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">Preview your generated app</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-[280px] leading-relaxed">
                        Describe an app on the left and press <span className="text-primary-300 font-semibold">Build App</span>. The real,
                        running app will render here.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: build status + files */}
        <div className="ab-col ab-col-files">
          {(busy || log.length > 0 || pipeline === 'error') && (
            <div className="ab-panel ab-log-panel">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <TerminalSquare className="w-3.5 h-3.5 text-cyan-300" />
                <span className="ab-panel-label !mb-0">Build &amp; status</span>
                <div className="ml-auto flex items-center gap-1.5">
                  {currentSteps.map((s, i) => {
                    const done = i < activeStepIndex || pipeline === 'ready';
                    const active = i === activeStepIndex;
                    return (
                      <span
                        key={s}
                        className={cn(
                          'ab-progress-dot',
                          done && 'is-done',
                          active && 'is-active'
                        )}
                        title={STEP_LABELS[s]?.label}
                      />
                    );
                  })}
                </div>
              </div>

              {pipeline === 'error' && lastErrors && (
                <div className="ab-error-box mb-2">
                  <p className="text-[12px] font-bold text-red-200 mb-1">Build failed — the AI hit its repair limit.</p>
                  <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-[11px] font-mono text-red-300/90 scrollbar-thin">
                    {lastErrors.slice(0, 700)}
                  </pre>
                  <button onClick={repair} disabled={busy} className="ab-repair-btn mt-3">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                    Ask AI to Fix
                  </button>
                </div>
              )}

              <div
                ref={logRef}
                className="ab-terminal h-[110px] overflow-y-auto font-mono text-[11px] leading-[1.6] text-cyan-200/80 scrollbar-thin"
              >
                {log.length === 0 ? (
                  <span className="text-gray-600">// Build pipeline output will appear here.</span>
                ) : (
                  log.map((l, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      <span className="text-primary-400/70 select-none">$ </span>
                      {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {projectId ? (
            <div className="ab-panel ab-files min-h-0 flex-1 flex flex-col">
              <div className="ab-panel-label shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-violet-300" /> Generated files
                </span>
                <button onClick={() => refreshFiles(projectId)} className="ab-mini-btn !px-2 !py-1" title="Refresh">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {showWelcome && !busy && files.length === 0 && (
                <div className="ab-empty flex-1 flex flex-col items-center justify-center text-center py-4">
                  <Boxes className="w-8 h-8 text-white/15 mb-2" />
                  <p className="text-xs text-gray-500">Your generated project files will appear here.</p>
                </div>
              )}

              <div className="ab-file-tree flex-1 overflow-y-auto scrollbar-thin mt-1">
                {tree.root.map((f) => (
                  <FileRow key={f} path={f} selected={selectedFile === f} onSelect={() => loadFile(f)} />
                ))}
                {tree.dirs.map((d) => (
                  <div key={d.name}>
                    <button
                      onClick={() => toggleDir(d.name, '')}
                      className="ab-dir-row w-full"
                    >
                      {expanded.has(`${d.name}/`) || (expanded.has(d.name) && !d.subdirs.length) ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <FolderOpen className="w-4 h-4 text-amber-300/80" />
                      {d.name}
                    </button>
                    {((expanded.has(`${d.name}/`) || (expanded.has(d.name) && !d.subdirs.length))) && (
                      <div className="ab-dir-children">
                        {d.files.map((f) => (
                          <FileRow key={f} path={f} selected={selectedFile === f} onSelect={() => loadFile(f)} />
                        ))}
                        {d.subdirs.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => toggleDir(`${d.name}/`, sub)}
                            className="ab-dir-row w-full"
                          >
                            {expanded.has(`${d.name}/${sub}`) ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                            <FolderOpen className="w-4 h-4 text-amber-300/80" />
                            {sub}
                          </button>
                        ))}
                        {expanded.has(`${d.name}/`) && (
                          <div className="ab-dir-children">
                            {d.subdirs.map((sub) => (
                              <div key={sub}>
                                <button onClick={() => toggleDir(`${d.name}/${sub}`, '')} className="ab-dir-row full w-full">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <FolderOpen className="w-4 h-4 text-amber-300/80" />
                                  {sub}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ab-file-viewer mt-2">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                        <FileCode2 className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="font-mono text-[12px] text-gray-200 truncate">{selectedFile}</span>
                        <button onClick={() => setSelectedFile(null)} className="ab-mini-btn ml-auto !px-2 !py-0.5 text-[11px]">
                          Close
                        </button>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
                        {loadingFile ? (
                          <div className="p-4 text-gray-500 text-xs flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading file...
                          </div>
                        ) : fileContent ? (
                          <div className="p-3 text-[12px]">
                            <Markdown content={'```' + extFor(selectedFile) + '\n' + fileContent + '\n```'} />
                          </div>
                        ) : (
                          <div className="p-4 text-gray-500 text-xs">No content.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ab-panel ab-files flex-1 flex flex-col items-center justify-center text-center py-8 min-h-[240px]">
              <FolderPlus className="w-9 h-9 text-white/15 mb-3" />
              <p className="text-sm font-semibold text-gray-300">No project open</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[260px] leading-relaxed">
                Press <span className="text-primary-300 font-semibold">Build App</span> to create one, or{' '}
                <button onClick={() => setModal('open')} className="text-cyan-300 hover:underline font-semibold">
                  Open a project
                </button>{' '}
                from your workspace.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project management modals */}
      <Modal open={modal !== null} onClose={() => setModal(null)} title={modalTitle} size={modal === 'open' ? 'lg' : 'sm'}>
        {modal === 'open' && (
          <ModalContent>
            {projectList.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No projects yet. Describe an app on the left and press <span className="text-primary-300 font-semibold">Build App</span> to
                create your first one.
              </p>
            ) : (
              <div className="max-h-[420px] overflow-y-auto space-y-2 scrollbar-thin pr-1">
                {projectList.map((p) => (
                  <button
                    key={p.project_id}
                    onClick={() => {
                      setModal(null);
                      openProject(p);
                    }}
                    className="ab-project-open-item"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-400/20 border border-primary-500/30 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-primary-300" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-gray-100">{p.name}</span>
                      <span className="block text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                        {p.project_id} · modified {formatDate(p.updated_at || p.created_at)}
                      </span>
                    </span>
                    <span className="shrink-0 flex items-center gap-1">
                      {p.build_success && (
                        <span className="ab-meta-chip is-ok">
                          <CircleDot className="w-3 h-3" /> built
                        </span>
                      )}
                      {p.preview_running && (
                        <span className="ab-meta-chip is-live">live</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ModalContent>
        )}

        {modal === 'rename' && (
          <ModalContent>
            <Input
              label="Project name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doRename()}
              placeholder="My amazing app"
              autoFocus
            />
            <ModalFooter>
              <button onClick={() => setModal(null)} className="ab-mini-btn ml-auto">
                Cancel
              </button>
              <button onClick={doRename} className="ab-repair-btn">
                <Pencil className="w-3.5 h-3.5" /> Save Name
              </button>
            </ModalFooter>
          </ModalContent>
        )}

        {modal === 'duplicate' && (
          <ModalContent>
            <Input
              label="New project name (optional)"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doDuplicate()}
              placeholder={`${projectName} (copy)`}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Creates a full copy of <span className="text-gray-300 font-semibold">{projectName}</span> including its generated files, ready
              to build again.
            </p>
            <ModalFooter>
              <button onClick={() => setModal(null)} className="ab-mini-btn ml-auto">
                Cancel
              </button>
              <button onClick={doDuplicate} className="ab-repair-btn">
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
            </ModalFooter>
          </ModalContent>
        )}

        {modal === 'delete' && (
          <ModalContent>
            <p className="text-sm text-gray-300 leading-relaxed">
              Delete <span className="text-white font-bold">{projectName}</span>? All generated files for this project will be removed from
              the workspace. This cannot be undone.
            </p>
            <ModalFooter>
              <button onClick={() => setModal(null)} className="ab-mini-btn ml-auto">
                Cancel
              </button>
              <button onClick={doDelete} className="ab-pm-btn is-danger">
                <Trash2 className="w-3.5 h-3.5" /> Delete Project
              </button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}

function FileRow({ path, selected, onSelect }: { path: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={cn('ab-file-row w-full', selected && 'is-selected')}>
      <FileIcon className="w-3.5 h-3.5 shrink-0 text-cyan-300/80" />
      <span className="truncate">{path.split('/').pop()}</span>
    </button>
  );
}