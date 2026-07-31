'use client';

import { useStore } from './store';
import { authAPI, chatAPI, resumeAPI, aiAPI, notificationsAPI, taskAPI, jobAPI, docAPI, analyticsAPI } from './api';
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { setCookie, removeCookie } from './utils';

export function useAuth() {
  const { user, setUser, token, setToken } = useStore();

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    setCookie('access_token', res.data.access_token);
    setCookie('refresh_token', res.data.refresh_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data;
  }, [setUser, setToken]);

  const register = useCallback(async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const res = await authAPI.register(data);
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    setCookie('access_token', res.data.access_token);
    setCookie('refresh_token', res.data.refresh_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data;
  }, [setUser, setToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    removeCookie('access_token');
    removeCookie('refresh_token');
    setToken(null);
    setUser(null);
  }, [setUser, setToken]);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        setToken(token);
        const res = await authAPI.me();
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeCookie('access_token');
      removeCookie('refresh_token');
      setToken(null);
      setUser(null);
    }
  }, [setUser, setToken]);

  return { user, token, login, register, logout, loadUser };
}

export function useChat() {
  const { chats, setChats, activeChat, setActiveChat, messages, setMessages, addMessage } = useStore();

  const loadChats = useCallback(async () => {
    const res = await chatAPI.list();
    setChats(res.data);
  }, [setChats]);

  const createChat = useCallback(async (title?: string, agentType?: string) => {
    const res = await chatAPI.create({ title, agent_type: agentType });
    const chat = res.data;
    setChats([chat, ...chats]);
    setActiveChat(chat);
    setMessages([]);
    return chat;
  }, [chats, setChats, setActiveChat, setMessages]);

  const loadMessages = useCallback(async (chatId: number) => {
    const res = await chatAPI.messages(chatId);
    setMessages(res.data);
  }, [setMessages]);

  const sendMessage = useCallback(async (chatId: number, content: string) => {
    const res = await chatAPI.send(chatId, content);
    return res;
  }, []);

  return { chats, activeChat, messages, loadChats, createChat, loadMessages, sendMessage, setActiveChat, addMessage };
}

export function useResume() {
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: (formData: FormData) => resumeAPI.analyze(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeHistory'] });
      toast.success('Resume analyzed successfully');
    },
    onError: () => toast.error('Failed to analyze resume'),
  });

  const historyQuery = useQuery({
    queryKey: ['resumeHistory'],
    queryFn: () => resumeAPI.history().then((r) => r.data),
  });

  return {
    analyze: analyzeMutation.mutateAsync,
    isAnalyzing: analyzeMutation.isPending,
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
  };
}

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: ({ title, description, priority }: { title: string; description?: string; priority?: string }) =>
      taskAPI.create(title, description, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => taskAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const generateFromGoalMutation = useMutation({
    mutationFn: (goal: string) => taskAPI.generateFromGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tasks generated from goal');
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    createTask: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    generateFromGoal: generateFromGoalMutation.mutateAsync,
    isGenerating: generateFromGoalMutation.isPending,
  };
}

export function useJobs() {
  const queryClient = useQueryClient();

  const savedJobsQuery = useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => jobAPI.saved().then((r) => r.data),
  });

  const recommendationsQuery = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: () => jobAPI.recommendations().then((r) => r.data),
  });

  const searchMutation = useMutation({
    mutationFn: ({ query, location, job_type }: { query: string; location?: string; job_type?: string }) =>
      jobAPI.search(query, location, job_type),
  });

  const saveMutation = useMutation({
    mutationFn: (id: number) => jobAPI.save(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      toast.success('Job saved');
    },
  });

  return {
    savedJobs: savedJobsQuery.data || [],
    recommendations: recommendationsQuery.data || [],
    search: searchMutation.mutateAsync,
    searchResults: searchMutation.data?.data || [],
    isSearching: searchMutation.isPending,
    saveJob: saveMutation.mutateAsync,
  };
}

export function useDocuments() {
  const queryClient = useQueryClient();

  const docsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => docAPI.list().then((r) => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: ({ doc_type, context }: { doc_type: string; context: any }) => docAPI.generate(doc_type, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document generated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || err?.message || 'Failed to generate document'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => docAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  return {
    documents: docsQuery.data || [],
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    delete: deleteMutation.mutateAsync,
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { setNotifications, setUnreadCount } = useStore();

  const notifsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list().then((r) => {
      setNotifications(r.data);
      setUnreadCount(r.data.filter((n: any) => !n.is_read).length);
      return r.data;
    }),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return {
    notifications: notifsQuery.data || [],
    markRead: markReadMutation.mutateAsync,
  };
}

export function useAnalytics() {
  const dashboardQuery = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: () => analyticsAPI.dashboard().then((r) => r.data),
  });

  const adminQuery = useQuery({
    queryKey: ['analyticsAdmin'],
    queryFn: () => analyticsAPI.admin().then((r) => r.data),
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    admin: adminQuery.data,
  };
}
