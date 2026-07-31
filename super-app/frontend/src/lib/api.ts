import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (val: any) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const newToken = res.data.access_token;
          localStorage.setItem('access_token', res.data.access_token);
          localStorage.setItem('refresh_token', res.data.refresh_token);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { email: string; username: string; password: string; full_name?: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
};

export const chatAPI = {
  create: (data: { title?: string; model?: string; agent_type?: string }) => api.post('/chat/', data),
  list: () => api.get('/chat/'),
  messages: (chatId: number) => api.get(`/chat/${chatId}/messages`),
  rename: (chatId: number, title: string) => api.patch(`/chat/${chatId}`, { title }),
  delete: (chatId: number) => api.delete(`/chat/${chatId}`),
  send: (chatId: number, content: string) => api.post(`/chat/${chatId}/message`, { content }, { responseType: 'text' }),
  sendStream: async (
    chatId: number,
    content: string,
    onChunk: (chunk: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: any) => void,
    onAbort: (abort: () => void) => void
  ) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const controller = new AbortController();
    onAbort(() => controller.abort());
    try {
      const response = await fetch(`${API_BASE}/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        const text = await response.text();
        onChunk(text);
        onDone(text);
        return;
      }
      const decoder = new TextDecoder();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onChunk(chunk);
      }
      onDone(fullText);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onDone('');
        return;
      }
      onError(err);
    }
  },
};

export const resumeAPI = {
  analyze: (formData: FormData) => api.post('/resume/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  history: () => api.get('/resume/history'),
};

export const aiAPI = {
  chat: (message: string, agent_type?: string) => api.post('/ai/chat', { message, agent_type }),
  summarize: (text: string, max_length?: number) => api.post('/ai/summarize', { text, max_length }),
  translate: (text: string, target_language: string, source_language?: string) => api.post('/ai/translate', { text, target_language, source_language }),
  research: (topic: string, depth?: string) => api.post('/ai/research', { topic, depth }),
  explainCode: (code: string, language?: string) => api.post('/ai/code/explain', { code, language }),
  fixCode: (code: string, error?: string) => api.post('/ai/code/fix', { code, error }),
  generateCode: (prompt: string, language?: string) => api.post('/ai/code/generate', { prompt, language }),
  reviewCode: (code: string, language?: string) => api.post('/ai/code/review', { code, language }),
  findBugs: (code: string, language?: string) => api.post('/ai/code/bug-finder', { code, language }),
  roadmap: (current_role: string, target_role: string) => api.post('/ai/career/roadmap', { current_role, target_role }),
  interview: (role: string, company?: string) => api.post('/ai/career/interview', { role, company }),
  salary: (role: string, experience: number, location: string, skills: string) => api.post('/ai/career/salary', { role, experience, location, skills }),
  generateImage: (prompt: string, style?: string) => api.post('/ai/image/generate', { prompt, style }),
  describeImage: (formData: FormData) => api.post('/ai/image/describe', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  captionImage: (formData: FormData) => api.post('/ai/image/caption', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  ocr: (formData: FormData) => api.post('/ai/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  stt: (formData: FormData) => api.post('/ai/voice/stt', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  tts: (text: string, language?: string) => api.post('/ai/voice/tts', { text, language }),
  ragQuery: (collection_name: string, query: string) => api.post('/ai/rag/query', { collection_name, query }),
  ragProcess: (collection_name: string, text: string) => api.post('/ai/rag/process', { collection_name, text }),
  notes: (topic: string) => api.post('/ai/notes', { topic }),
  mindmap: (topic: string) => api.post('/ai/mindmap', { topic }),
  meetingSummary: (transcript: string) => api.post('/ai/meeting/summarize', { transcript }),
  youtubeSummary: (url: string) => api.post('/ai/youtube/summarize', { url }),
  generateWriting: (content_type: string, topic: string, tone?: string, keywords?: string, length?: string) =>
    api.post('/ai/writing/generate', { content_type, topic, tone, keywords, length }),
  generateEmail: (email_type: string, context: string, recipient_name?: string, recipient_email?: string, subject?: string, tone?: string) =>
    api.post('/ai/email/generate', { email_type, context, recipient_name, recipient_email, subject, tone }),
  improveEmail: (email_content: string, tone?: string) => api.post('/ai/email/improve', { email_content, tone }),
  generateCoverLetter: (formData: FormData) => api.post('/ai/cover-letter/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  generateInterviewPrep: (formData: FormData) => api.post('/ai/interview/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const docAPI = {
  generate: (doc_type: string, context: any) => api.post('/documents/generate', { doc_type, context }),
  list: () => api.get('/documents/'),
  delete: (id: number) => api.delete(`/documents/${id}`),
};

export const jobAPI = {
  search: (query: string, location?: string, job_type?: string) => api.get('/jobs/search', { params: { query, location, job_type } }),
  saved: () => api.get('/jobs/saved'),
  save: (id: number) => api.post(`/jobs/${id}/save`),
  recommendations: () => api.get('/jobs/recommendations'),
};

export const taskAPI = {
  create: (title: string, description?: string, priority?: string) => api.post('/tasks/', { title, description, priority }),
  list: () => api.get('/tasks/'),
  updateStatus: (id: number, status: string) => api.post(`/tasks/${id}/status`, { status }),
  generateFromGoal: (goal: string) => api.post('/tasks/generate-from-goal', { goal }),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  admin: () => api.get('/analytics/admin'),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
};

export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
};
