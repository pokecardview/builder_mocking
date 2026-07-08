'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import AgentDebateLog from './AgentDebateLog';
import DeployStatus from './DeployStatus';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  agent_type?: 'yc' | 'pm' | 'techlead';
  content: string;
  created_at: string;
};

type DeploymentInfo = {
  id: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  github_repo_url?: string;
  supabase_project_ref?: string;
  logs?: string;
};

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debateLog, setDebateLog] = useState<any[]>([]);
  const [generated, setGenerated] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'netlify' | 'vercel' | 'cloudflare'>('netlify');

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        setDebateLog(data.filter(m => m.agent_type).map(m => ({ agent: m.agent_type!, content: m.content, timestamp: m.created_at })));
      }
    };
    loadMessages();
    const channel = supabase.channel(`messages:session_id=eq.${sessionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
      const newMsg = payload.new as Message;
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.agent_type) setDebateLog(prev => [...prev, { agent: newMsg.agent_type!, content: newMsg.content, timestamp: newMsg.created_at }]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    await fetch(`/api/sessions/${sessionId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input }) });
    setInput('');
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/generate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) setGenerated(true);
    else alert('Erreur: ' + data.error);
    setLoading(false);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    const res = await fetch(`/api/sessions/${sessionId}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider }),
    });
    const data = await res.json();
    if (res.ok) {
      pollDeploymentStatus(data.deployment);
    } else {
      alert('Erreur: ' + data.error);
      setDeploying(false);
    }
  };

  const pollDeploymentStatus = async (deployId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/deployments/${deployId}`);
      const data = await res.json();
      if (data.deployment) {
        setDeployment(data.deployment);
        if (data.deployment.status === 'success' || data.deployment.status === 'failed') {
          clearInterval(interval);
          setDeploying(false);
        }
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.agent_type && <div className="text-xs font-semibold uppercase mb-1">{msg.agent_type}</div>}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-lg"><em>Les agents réfléchissent...</em></div></div>}
      </div>
      <div className="border-t p-3 bg-white space-y-2">
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={loading || generated} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">{generated ? 'Code généré' : 'Générer le code'}</button>
          <div className="flex gap-1 items-center">
            <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value as any)} className="text-sm border p-1 rounded">
              <option value="netlify">Netlify</option>
              <option value="vercel">Vercel</option>
              <option value="cloudflare">Cloudflare</option>
            </select>
            <button onClick={handleDeploy} disabled={loading || !generated || deploying} className="px-3 py-1 bg-purple-600 text-white rounded text-sm disabled:opacity-50">{deploying ? 'Déploiement...' : 'Déployer'}</button>
          </div>
        </div>
        {deployment && <DeployStatus deployment={deployment} />}
      </div>
      <AgentDebateLog entries={debateLog} />
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Décrivez votre idée de produit..." className="flex-1 p-2 border rounded" />
          <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
