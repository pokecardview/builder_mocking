'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import AgentDebateLog from './AgentDebateLog';
import DeployStatus from './DeployStatus';
import CodeViewer from './CodeViewer';

type Message = { id: string; role: 'user' | 'assistant'; agent_type?: 'yc' | 'pm' | 'techlead'; content: string; created_at: string; };
type DeploymentInfo = { id: string; status: string; github_repo_url?: string; supabase_project_ref?: string; logs?: string; };

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debateLog, setDebateLog] = useState<any[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'netlify' | 'vercel' | 'cloudflare'>('netlify');

  useEffect(() => {
    supabase.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }).then(({ data }) => {
      if (data) {
        setMessages(data);
        setDebateLog(data.filter(m => m.agent_type).map(m => ({ agent: m.agent_type!, content: m.content, timestamp: m.created_at })));
      }
    });
    const channel = supabase.channel(`messages:session_id=eq.${sessionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, payload => {
      const newMsg = payload.new as Message;
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.agent_type) setDebateLog(prev => [...prev, { agent: newMsg.agent_type!, content: newMsg.content, timestamp: newMsg.created_at }]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    });
    setInput('');
    if (!res.ok) alert('Erreur API');
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/generate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setGeneratedFiles(data.files);
      setShowCode(true);
    } else alert('Erreur: ' + data.error);
    setLoading(false);
  };

  const handleDeploy = async () => { /* ... inchangé ... */ };

  return (
    <div className="flex h-full">
      {/* Panneau de chat (gauche) */}
      <div className="w-1/3 flex flex-col border-r">
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
        <div className="border-t p-3">
          <button onClick={handleGenerate} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded text-sm mb-2">Générer le code</button>
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Décrivez votre idée..." className="flex-1 p-2 border rounded" />
            <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Envoyer</button>
          </div>
        </div>
      </div>
      {/* Panneau de code / preview (droite) */}
      <div className="w-2/3">
        {showCode && generatedFiles.length > 0 ? (
          <CodeViewer files={generatedFiles} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Le code généré apparaîtra ici après avoir cliqué sur "Générer le code".
          </div>
        )}
      </div>
    </div>
  );
}
