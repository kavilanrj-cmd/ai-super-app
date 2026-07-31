export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  credits: number;
  created_at?: string;
}

export interface Chat {
  id: number;
  title?: string;
  model?: string;
  agent_type?: string;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  role: string;
  content: string;
  content_type?: string;
  created_at?: string;
}

export interface Resume {
  id: number;
  title: string;
  ats_score?: number;
  skills_found: string[];
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company?: string;
  location?: string;
  description?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  source_url?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at?: string;
}

export interface Document {
  id: number;
  title: string;
  doc_type: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message?: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Analytics {
  total_chats: number;
  total_messages: number;
  total_documents: number;
  active_days: number;
}

export type AgentType = 'resume' | 'career' | 'research' | 'coding' | 'medical' | 'finance' | 'translator' | 'summarizer' | 'document' | 'vision' | 'planning';
