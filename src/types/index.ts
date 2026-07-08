export interface Session {
  id: string;
  user_id: string;
  title: string | null;
  status: 'active' | 'closed';
  phase: string;
  created_at: string;
  updated_at: string;
}
export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  agent_type?: 'yc' | 'pm' | 'techlead';
  content: string;
  created_at: string;
}
export interface GeneratedFile {
  id: string;
  session_id: string;
  file_path: string;
  content: string;
  created_at: string;
}
export interface Deployment {
  id: string;
  session_id: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  github_repo_url?: string;
  supabase_project_ref?: string;
  logs?: string;
  created_at: string;
  updated_at: string;
}
