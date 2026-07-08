const STORE_KEY = 'prodcoach_sessions';

export interface Session {
  id: string;
  user_id: string;
  title: string;
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

function getStore(): Record<string, Session & { messages: Message[] }> {
  const raw = localStorage.getItem(STORE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveStore(store: Record<string, any>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function createSession(userId: string, title: string): Session {
  const store = getStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const session: Session & { messages: Message[] } = {
    id,
    user_id: userId,
    title,
    status: 'active',
    phase: 'ideation',
    created_at: now,
    updated_at: now,
    messages: [],
  };
  store[id] = session;
  saveStore(store);
  return { id, user_id: userId, title, status: 'active', phase: 'ideation', created_at: now, updated_at: now };
}

export function getSessions(userId: string): Session[] {
  const store = getStore();
  return Object.values(store)
    .filter(s => s.user_id === userId)
    .map(({ messages, ...rest }) => rest)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getSession(sessionId: string): (Session & { messages: Message[] }) | null {
  const store = getStore();
  return store[sessionId] || null;
}

export function addMessage(sessionId: string, message: Message) {
  const store = getStore();
  if (store[sessionId]) {
    store[sessionId].messages.push(message);
    store[sessionId].updated_at = new Date().toISOString();
    saveStore(store);
  }
}

export function getMessages(sessionId: string): Message[] {
  const store = getStore();
  return store[sessionId]?.messages || [];
}
