'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { chatAPI } from '@/lib/api';
import {
  Plus, MessageSquare, Bot, User, Trash2, Sparkles,
  Code, FileText, Brain, Stethoscope, DollarSign,
  Languages, BookOpen, PenTool, Image, ListChecks, StopCircle,
  Briefcase, Copy, Check, RotateCw, Search, Pencil, X,
  ArrowUp, PanelLeft, Volume2
} from 'lucide-react';
import { Message, AgentType } from '@/types';
import toast from 'react-hot-toast';
import { formatTime } from '@/lib/utils';
import { Markdown, ThinkingIndicator, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

const agents: { type: AgentType; icon: any; label: string; color: string }[] = [
  { type: 'resume', icon: FileText, label: 'Resume', color: 'from-blue-500 to-cyan-500' },
  { type: 'career', icon: Briefcase, label: 'Career', color: 'from-emerald-500 to-teal-500' },
  { type: 'coding', icon: Code, label: 'Coding', color: 'from-purple-500 to-pink-500' },
  { type: 'research', icon: Brain, label: 'Research', color: 'from-orange-500 to-amber-500' },
  { type: 'medical', icon: Stethoscope, label: 'Medical', color: 'from-red-500 to-rose-500' },
  { type: 'finance', icon: DollarSign, label: 'Finance', color: 'from-emerald-500 to-green-500' },
  { type: 'translator', icon: Languages, label: 'Translate', color: 'from-indigo-500 to-blue-500' },
  { type: 'summarizer', icon: BookOpen, label: 'Summarize', color: 'from-violet-500 to-purple-500' },
  { type: 'document', icon: PenTool, label: 'Document', color: 'from-pink-500 to-rose-500' },
  { type: 'vision', icon: Image, label: 'Vision', color: 'from-cyan-500 to-blue-500' },
  { type: 'planning', icon: ListChecks, label: 'Planning', color: 'from-amber-500 to-orange-500' },
];

const suggestedPrompts = [
  { icon: Brain, text: 'Explain how neural networks learn', desc: 'Concepts' },
  { icon: Code, text: 'Write a function to reverse a linked list', desc: 'Coding' },
  { icon: PenTool, text: 'Draft a professional email requesting a meeting', desc: 'Writing' },
  { icon: Briefcase, text: 'Give me tips for my job interview', desc: 'Career' },
];

const followUps = ['Explain this in more detail', 'Give me a simple example', 'Summarize the key points', 'What are the alternatives?'];

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const clean = text.replace(/[#*`>|~\[\]\(\)]/g, ' ').slice(0, 3000);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }, [speaking]);

  useEffect(() => () => synthRef.current?.cancel(), []);
  return { speak, speaking };
}

function MessageActions({
  onCopy, onRegenerate, onEdit, content, speaking, onSpeak,
}: {
  onCopy: () => void; onRegenerate?: () => void; onEdit?: () => void;
  content: string; speaking?: boolean; onSpeak?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
      <button
        onClick={() => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        aria-label="Copy message"
        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {onSpeak && (
        <button
          onClick={onSpeak}
          aria-label="Read aloud"
          className={cn('p-1.5 rounded-lg hover:bg-white/10 transition-colors', speaking ? 'text-primary-400' : 'text-gray-500 hover:text-gray-200')}
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit prompt"
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          aria-label="Regenerate response"
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChatState] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [abortStream, setAbortStream] = useState<(() => void) | null>(null);
  const [showChatList, setShowChatList] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [thinkingDelay, setThinkingDelay] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user = useStore((s) => s.user);
  const { speak, speaking } = useSpeech();

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await chatAPI.list();
      setChats(res.data);
    } catch { /* ignore */ }
    finally { setLoadingChats(false); }
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  const isNearBottom = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && isNearBottom.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, streamingContent, thinkingDelay]);

  useEffect(() => {
    if (!streaming) inputRef.current?.focus();
  }, [streaming]);

  const createChat = async () => {
    try {
      const res = await chatAPI.create({ title: 'New Chat', agent_type: selectedAgent || undefined });
      setChats((prev) => [res.data, ...prev]);
      setActiveChatState(res.data);
      setMessages([]);
      setShowChatList(false);
    } catch { toast.error('Failed to create chat'); }
  };

  const selectChat = async (chat: any) => {
    if (streaming) { abortStream?.(); setStreaming(false); setStreamingContent(''); }
    setActiveChatState(chat);
    setSelectedAgent(chat.agent_type);
    setLoadingMessages(true);
    try {
      const res = await chatAPI.messages(chat.id);
      setMessages(res.data);
      isNearBottom.current = true;
    } catch { toast.error('Failed to load messages'); }
    finally { setLoadingMessages(false); }
    setShowChatList(false);
  };

  const handleRename = async (chatId: number, title: string) => {
    try {
      const res = await chatAPI.rename(chatId, title);
      setChats((prev) => prev.map((c) => c.id === chatId ? res.data : c));
      if (activeChat?.id === chatId) setActiveChatState((prev: any) => ({ ...prev, title }));
    } catch { toast.error('Failed to rename chat'); }
  };

  const renameChat = (chatId: number, currentTitle: string) => {
    const title = window.prompt('Rename chat:', currentTitle || '');
    if (title && title.trim() && title.trim() !== currentTitle) {
      handleRename(chatId, title.trim());
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || !activeChat || streaming) return;

    const userMsg: Message = {
      id: Date.now(), chat_id: activeChat.id, role: 'user',
      content: text, content_type: 'text', created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamingContent('');
    setThinkingDelay(Date.now());

    let cancelFn: () => void = () => {};
    chatAPI.sendStream(
      activeChat.id,
      text,
      (chunk) => setStreamingContent((prev) => prev + chunk),
      (fullText) => {
        if (fullText) {
          const aiMsg: Message = {
            id: Date.now() + 1, chat_id: activeChat.id, role: 'assistant',
            content: fullText, content_type: 'text', created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setChats((prev) => {
            const existing = prev.find((c) => c.id === activeChat.id);
            if (existing?.title === 'New Chat' && fullText.length > 20) {
              const newTitle = fullText.slice(0, 50) + (fullText.length > 50 ? '...' : '');
              chatAPI.rename(activeChat.id, newTitle).then((res) => {
                setChats((p) => p.map((c) => c.id === activeChat.id ? res.data : c));
                setActiveChatState((p: any) => ({ ...p, title: newTitle }));
              }).catch(() => {});
            }
            return prev;
          });
        }
        setStreaming(false);
        setStreamingContent('');
      },
      (err) => {
        toast.error('Failed to send message');
        setStreaming(false);
        setStreamingContent('');
      },
      (cancel) => { cancelFn = cancel; setAbortStream(() => cancel); }
    );
  };

  const regenerate = async (message?: string) => {
    const prompt = message ?? [...messages].reverse().find((m) => m.role === 'user')?.content;
    if (!prompt || !activeChat) return;
    setMessages((prev) => prev.filter((m) => m.role === 'assistant'));
    setStreaming(true);
    setStreamingContent('');
    setThinkingDelay(Date.now());

    chatAPI.sendStream(
      activeChat.id,
      prompt,
      (chunk) => setStreamingContent((prev) => prev + chunk),
      (fullText) => {
        if (fullText) {
          const aiMsg: Message = {
            id: Date.now() + 2, chat_id: activeChat.id, role: 'assistant',
            content: fullText, content_type: 'text', created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
        setStreaming(false);
        setStreamingContent('');
      },
      (err) => {
        toast.error('Failed to regenerate');
        setStreaming(false);
        setStreamingContent('');
      },
      (cancel) => setAbortStream(() => cancel)
    );
  };

  const stopGeneration = () => {
    abortStream?.();
    if (streamingContent) {
      const aiMsg: Message = {
        id: Date.now() + 3, chat_id: activeChat.id, role: 'assistant',
        content: streamingContent, content_type: 'text', created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
    setStreaming(false);
    setStreamingContent('');
  };

  const deleteChat = async (chatId: number) => {
    try {
      await chatAPI.delete(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat?.id === chatId) { setActiveChatState(null); setMessages([]); }
      toast.success('Chat deleted');
    } catch { toast.error('Failed to delete chat'); }
  };

  const editMessage = async (msgId: number) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    setEditingId(msgId);
    setEditText(msg.content);
  };

  const saveEdit = async (msgId: number) => {
    if (!editText.trim()) return;
    const msg = messages.find((m) => m.id === msgId);
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (!msg) return;

    const updated = [...messages.slice(0, msgIndex), { ...msg, content: editText }];
    setMessages(updated);
    setEditingId(null);
    setEditText('');
    await new Promise((r) => setTimeout(r, 50));
    regenerate(editText);
  };

  const filteredChats = chats.filter((c) =>
    !chatSearch || c.title?.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const activeAgent = agents.find((a) => a.type === selectedAgent);

  const emptyState = !activeChat;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden relative">
      {/* Conversation list - desktop */}
      <div className="hidden md:flex w-[280px] shrink-0 border-r border-white/[0.06] flex-col bg-[#0a0a12]/70 backdrop-blur-xl">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-400" /> Conversations
            </h2>
            <button
              onClick={createChat}
              aria-label="New chat"
              className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-glow-sm hover:shadow-glow transition-shadow"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-xl text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-primary-500/40 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {loadingChats ? (
            <div className="space-y-3 p-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-600 mb-2" />
              <p className="text-xs text-gray-500">{chatSearch ? 'No chats found' : 'No conversations yet'}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={cn(
                    'group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all',
                    activeChat?.id === chat.id
                      ? 'bg-gradient-to-r from-primary-500/15 to-transparent border border-primary-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                      chat.agent_type ? (agents.find((a) => a.type === chat.agent_type)?.color || 'from-primary-500 to-violet-500') : 'from-primary-500 to-violet-500'
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectChat(chat)}>
                    <p className="text-xs truncate text-gray-300">{chat.title || 'New Chat'}</p>
                    <p className="text-[10px] text-gray-600">
                      {chat.updated_at ? new Date(chat.updated_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); renameChat(chat.id, chat.title); }}
                      aria-label="Rename"
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                      aria-label="Delete"
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Mobile chat list drawer */}
      <AnimatePresence>
        {showChatList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChatList(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 350, damping: 34 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-[280px] max-w-[85vw] bg-[#0a0a12] border-r border-white/[0.08] flex flex-col md:hidden"
            >
              <div className="p-4 space-y-3 flex items-center justify-between">
                <button onClick={createChat} className="btn-primary flex items-center gap-2 text-xs px-3 py-2">
                  <Plus className="w-4 h-4" /> New Chat
                </button>
                <button onClick={() => setShowChatList(false)} aria-label="Close" className="p-1.5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 pb-3">
                <input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-xl text-xs focus:border-primary-500/40 outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={cn(
                      'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all',
                      activeChat?.id === chat.id ? 'bg-primary-500/15 border border-primary-500/25' : 'hover:bg-white/5 border border-transparent'
                    )}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-xs truncate text-gray-300">{chat.title || 'New Chat'}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!emptyState ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-white/[0.06] bg-[#0a0a12]/60 backdrop-blur-xl shrink-0">
              <button
                onClick={() => setShowChatList(true)}
                aria-label="Open conversations"
                className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                {activeAgent ? (
                  <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', activeAgent.color)}>
                    <activeAgent.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shrink-0 shadow-glow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{activeChat.title || 'New Chat'}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeAgent ? `${activeAgent.label} Agent` : 'General Assistant'}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {agents.slice(0, 6).map((agent) => (
                  <button
                    key={agent.type}
                    onClick={() => setSelectedAgent(selectedAgent === agent.type ? null : agent.type)}
                    aria-label={`Select ${agent.label} agent`}
                    className={cn(
                      'w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center transition-all ring-focus',
                      agent.color,
                      selectedAgent === agent.type ? 'ring-2 ring-white/70 scale-110 shadow-glow-sm' : 'opacity-60 hover:opacity-100 hover:scale-105'
                    )}
                    title={agent.label}
                  >
                    <agent.icon className="w-3.5 h-3.5 text-white" />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollContainerRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {loadingMessages ? (
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2.5 max-w-[78%]">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-5/6" />
                        <Skeleton className="h-3.5 w-2/3" />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="flex-1 space-y-2.5 max-w-[60%]">
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2.5 max-w-[78%]">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-4/5" />
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 && !streaming ? (
                  <div className="h-full flex items-center justify-center py-16">
                    <div className="text-center space-y-5 max-w-md">
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-30 blur-xl animate-pulse" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-glow">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold gradient-text tracking-tight">How can I help you today?</h3>
                        <p className="text-sm text-gray-500 mt-1.5">
                          {activeAgent ? `Chatting with the ${activeAgent.label} agent` : 'Ask anything or choose an agent for specialized help'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {suggestedPrompts.map((p, i) => (
                          <motion.button
                            key={p.text}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.07 }}
                            onClick={() => { setInput(p.text); inputRef.current?.focus(); }}
                            className="group glass-card !rounded-2xl p-3.5 text-left hover:border-primary-500/40 transition-all cursor-pointer"
                          >
                            <p.icon className="w-4 h-4 text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-medium text-gray-200 leading-relaxed">{p.text}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                      const isUser = msg.role === 'user';
                      const isEditing = editingId === msg.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className={cn('flex gap-3 group', isUser && 'justify-end')}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center min-w-[32px] shrink-0 shadow-glow-sm mt-1">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className={cn('flex flex-col max-w-[85%] sm:max-w-[78%]', isUser && 'items-end')}>
                            {isEditing ? (
                              <div className="w-full glass-card p-3 rounded-2xl space-y-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit(msg.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  autoFocus
                                  className="input-field text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingId(null)} className="btn-secondary !px-3 !py-1.5 text-xs">Cancel</button>
                                  <button onClick={() => saveEdit(msg.id)} className="btn-primary !px-3 !py-1.5 text-xs">Save & Send</button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  'px-4 py-3.5 rounded-2xl',
                                  isUser
                                    ? 'bg-gradient-to-br from-primary-500/90 to-violet-600/90 text-white shadow-lg shadow-primary-500/20 border border-primary-400/30 rounded-br-md'
                                    : 'glass-card !rounded-2xl border-white/[0.07] rounded-tl-md'
                                )}
                              >
                                {isUser ? (
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                ) : (
                                  <Markdown content={msg.content} />
                                )}
                              </div>
                            )}
                            <div className={cn('flex items-center gap-1 mt-1.5 px-1', isUser ? 'flex-row-reverse' : '')}>
                              <span className="text-[10px] text-gray-600">
                                {msg.created_at ? formatTime(msg.created_at) : ''}
                              </span>
                              {!isUser && (
                                <MessageActions
                                  content={msg.content}
                                  onCopy={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied to clipboard'); }}
                                  onRegenerate={() => regenerate()}
                                  onSpeak={() => speak(msg.content)}
                                  speaking={speaking}
                                />
                              )}
                              {isUser && (
                                <MessageActions
                                  content={msg.content}
                                  onCopy={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied to clipboard'); }}
                                  onEdit={() => editMessage(msg.id)}
                                />
                              )}
                            </div>
                          </div>
                          {isUser && (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center min-w-[32px] shrink-0 mt-1">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                {/* Streaming / thinking */}
                {streaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center min-w-[32px] shrink-0 shadow-glow-sm animate-glow">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-card !rounded-2xl px-4 py-3.5 max-w-[85%] sm:max-w-[78%] min-w-[120px]">
                      {streamingContent ? (
                        <div className="relative">
                          <Markdown content={streamingContent} />
                          <span className="streaming-cursor" aria-hidden="true" />
                        </div>
                      ) : (
                        <ThinkingIndicator />
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Follow-up suggestions after last assistant reply */}
                {messages.filter((m) => m.role === 'assistant').length > 0 && !streaming && (
                  <div className="flex flex-wrap gap-2 pl-0 lg:pl-11">
                    {followUps.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setInput(f); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 rounded-full text-xs bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/10 transition-all"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-white/[0.06] bg-gradient-to-b from-transparent to-[#0a0a12]/70 backdrop-blur-xl shrink-0 safe-bottom">
              <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3.5">
                <div className="relative glass-card !rounded-2xl flex items-end gap-2 p-2 focus-within:border-primary-500/40 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!streaming) sendMessage();
                      }
                    }}
                    placeholder={streaming ? 'AI is responding...' : (activeAgent ? `Ask the ${activeAgent.label} agent...` : 'Message Super App AI...')}
                    rows={1}
                    disabled={streaming}
                    className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-2 text-sm text-gray-200 placeholder:text-gray-500 disabled:opacity-50"
                    style={{ maxHeight: '140px' }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
                    }}
                  />
                  <button
                    onClick={streaming ? stopGeneration : () => sendMessage()}
                    disabled={!streaming && !input.trim()}
                    aria-label={streaming ? 'Stop generating' : 'Send message'}
                    className={cn(
                      'w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300',
                      streaming
                        ? 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
                        : 'bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-glow-sm hover:shadow-glow hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100'
                    )}
                  >
                    {streaming ? <StopCircle className="w-4.5 h-4.5" /> : <ArrowUp className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-2">
                  Super App AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500 to-fuchsia-500 opacity-30 blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-glow animate-float">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold gradient-text tracking-tight mb-2">AI Super Chat</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">Create a new conversation or select an existing one to begin.</p>
            <button onClick={createChat} className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
