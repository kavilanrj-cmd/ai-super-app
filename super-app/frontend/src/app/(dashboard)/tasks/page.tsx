'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { taskAPI } from '@/lib/api';
import {
  Plus, CheckCircle2, Circle, Clock, Sparkles,
  ListTodo, CheckSquare, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, EmptyState, Button, Input, CircularProgress, AnimatedNumber, SkeletonCard } from '@/components/ui';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showGoalInput, setShowGoalInput] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await taskAPI.list();
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setInitialLoading(false); }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await taskAPI.create(title);
      setTitle('');
      toast.success('Task created');
      loadTasks();
    } catch { toast.error('Failed to create task'); }
  };

  const toggleStatus = async (task: any) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await taskAPI.updateStatus(task.id, newStatus);
      loadTasks();
    } catch { toast.error('Failed to update task'); }
  };

  const generateFromGoal = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      await taskAPI.generateFromGoal(goal);
      setGoal('');
      setShowGoalInput(false);
      toast.success('Tasks generated!');
      loadTasks();
    } catch { toast.error('Failed to generate tasks'); }
    finally { setLoading(false); }
  };

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const pendingCount = tasks.length - doneCount;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const stats = [
    { icon: ListTodo, label: 'Total Tasks', value: tasks.length, color: 'from-blue-500 to-cyan-500' },
    { icon: CheckCircle2, label: 'Completed', value: doneCount, color: 'from-emerald-500 to-teal-500' },
    { icon: Clock, label: 'Pending', value: pendingCount, color: 'from-amber-500 to-orange-500' },
    { icon: Activity, label: 'Progress', value: completion, suffix: '%', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<CheckSquare className="w-6 h-6 text-white" />}
        title="Task Manager"
        subtitle="Organize your work with AI-powered task management"
        actions={
          <Button variant="gradient" onClick={() => setShowGoalInput(!showGoalInput)}>
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
        }
      />

      {showGoalInput && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/15 to-pink-500/15 border border-fuchsia-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200">Generate Tasks from Goal</h3>
                <p className="text-xs text-gray-500">Let AI break down your goal into actionable tasks</p>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); generateFromGoal(); }} className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe your goal..."
                  className="w-full"
                />
              </div>
              <Button type="submit" loading={loading} className="shrink-0">
                {!loading && <Sparkles className="w-4 h-4" />}
                Generate
              </Button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {initialLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="!p-5" />)
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.5 }}
              className="glass-card p-4 sm:p-5 space-y-3 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform', stat.color)}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Live
                </span>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={stat.value} format={(n) => `${n}${stat.suffix || ''}`} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Create form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
            <div className="glass-card p-4 sm:p-5">
              <form onSubmit={createTask} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    icon={<Plus className="w-4 h-4 text-gray-500" />}
                    placeholder="Add a new task..."
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Task list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary-400" />
                Your Tasks
              </h2>
              {tasks.length > 0 && (
                <span className="px-3 py-1 text-xs rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                  {tasks.length} total
                </span>
              )}
            </div>

            {initialLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="!p-4" />)}
              </div>
            ) : tasks.length === 0 ? (
              <div className="glass-card">
                <EmptyState
                  icon={<ListTodo className="w-8 h-8 text-primary-400" />}
                  title="No tasks yet"
                  description="Create your first task above or use AI to generate tasks from a goal."
                  className="!py-12"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      'glass-card !rounded-xl p-4 flex items-center gap-4 group hover:border-primary-500/25 transition-all',
                      task.status === 'done' && 'opacity-60'
                    )}
                  >
                    <button
                      onClick={() => toggleStatus(task)}
                      className="shrink-0 text-gray-500 hover:text-primary-400 transition-colors"
                      aria-label={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 group-hover:text-primary-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-gray-200 font-medium', task.status === 'done' && 'line-through text-gray-500')}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {task.due_date}
                        </p>
                      )}
                    </div>
                    <span className={cn('px-3 py-1 text-xs rounded-full border shrink-0', priorityStyles[task.priority] || 'bg-white/5 text-gray-400 border-white/10')}>
                      {task.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Progress panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Progress
          </h2>
          <div className="glass-card p-6 text-center space-y-4">
            <CircularProgress
              value={completion}
              size={150}
              strokeWidth={11}
              label="%"
              sublabel="Completed"
            />
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Completed</span>
                  <span className="text-white font-medium">{doneCount} / {tasks.length}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={pendingCount} /></p>
                  <p className="text-[10px] text-gray-500">Pending</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-lg font-bold text-white"><AnimatedNumber value={doneCount} /></p>
                  <p className="text-[10px] text-gray-500">Done</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
