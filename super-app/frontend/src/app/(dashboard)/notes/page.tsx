'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Textarea, Select, Badge, PageHeader, EmptyState } from '@/components/ui';
import { aiAPI } from '@/lib/api';
import { StickyNote, Search, Folder, Plus, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  createdAt: string;
}

const folderOptions = [
  { value: 'general', label: 'General' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'ai-notes', label: 'AI Notes' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const resetEditor = () => {
    setActiveNote(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const generateAINotes = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await aiAPI.notes(aiTopic);
      const newNote: Note = {
        id: Date.now().toString(),
        title: `Notes: ${aiTopic}`,
        content: res.data.notes,
        tags: ['ai-generated', 'notes'],
        folder: 'ai-notes',
        createdAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setActiveNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content);
      setTags(newNote.tags.join(', '));
      setFolder(newNote.folder);
      setAiTopic('');
      toast.success('AI notes generated');
    } catch { toast.error('Failed to generate notes'); }
    finally { setGenerating(false); }
  };

  const createNote = () => {
    if (!title.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      folder,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    toast.success('Note created');
  };

  const saveNote = () => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, title: title.trim() || 'Untitled', content, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), folder }
          : n
      )
    );
    toast.success('Note saved');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    if (activeNote?.id === id) resetEditor();
  };

  const openNote = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
    setFolder(note.folder);
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const folders = Array.from(new Set(notes.map((n) => n.folder)));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<StickyNote className="w-6 h-6 text-white" />}
        title="AI Notes"
        subtitle="Capture ideas, organize thoughts, and generate notes with AI"
        actions={
          <Button size="sm" onClick={resetEditor}>
            <Plus className="w-4 h-4" /> New Note
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[calc(100dvh-16rem)] min-h-[480px]">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden flex flex-col"
        >
          <div className="p-4 space-y-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-xl text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-primary-500/40 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="AI topic..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateAINotes()}
                className="flex-1 !py-2 text-xs"
              />
              <Button size="icon" onClick={generateAINotes} loading={generating} aria-label="Generate AI notes">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">Folders</p>
            {folders.length === 0 && <p className="text-xs text-gray-600 px-2 pb-1">No folders yet</p>}
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSearchQuery(f)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  searchQuery === f
                    ? 'text-white bg-primary-500/10 border border-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Folder className="w-4 h-4" />{f}
              </button>
            ))}

            <div className="border-t border-white/[0.06] pt-3 mt-3 space-y-1">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500">{searchQuery ? 'No notes found' : 'No notes yet'}</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => openNote(note)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all',
                      activeNote?.id === note.id ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{note.content.slice(0, 60)}...</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.slice(0, 2).map((t) => <Badge key={t} variant="default">{t}</Badge>)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card overflow-hidden flex flex-col"
        >
          {activeNote ? (
            <div className="flex flex-col h-full">
              <div className="p-5 sm:p-6 border-b border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold border-none bg-transparent px-0 !shadow-none"
                    placeholder="Note title..."
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={saveNote}>Save</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteNote(activeNote.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Tags (comma separated)"
                    className="flex-1"
                  />
                  <Select value={folder} onChange={(e) => setFolder(e.target.value)} options={folderOptions} className="w-full sm:w-44" />
                </div>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 border-none rounded-none min-h-0 resize-none font-mono text-sm bg-transparent"
                placeholder="Start writing..."
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <EmptyState
                icon={<StickyNote className="w-6 h-6 text-primary-400" />}
                title="Select or create a note"
                description="Use AI to generate notes or write your own"
                action={
                  <Button size="sm" onClick={createNote}>
                    <Plus className="w-4 h-4" /> Create Note
                  </Button>
                }
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
