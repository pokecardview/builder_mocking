'use client';
import { useState, useEffect, useRef } from 'react';
import { getMessages, addMessage, Message, getSession } from '@/lib/store';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import CodeViewer from './CodeViewer';

export default function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [showCode, setShowCode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userId = useAnonymousUser();

  useEffect(() => {
    if (userId) {
      setMessages(getMessages(sessionId));
    }
  }, [sessionId, userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };
    addMessage(sessionId, userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Appel à l'API pour obtenir la réponse de l'agent
    const res = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: userMessage.content }),
    });
    const data = await res.json();
    if (data.message) {
      addMessage(sessionId, data.message);
      setMessages(prev => [...prev, data.message]);
    }
    setLoading(false);
  };

  // ... reste du composant (identique à la version précédente, avec handleGenerate, etc.)
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Panneau de chat */}
      <div className={`flex flex-col border-r border-zinc-800 transition-all ${showCode ? 'w-1/3' : 'w-full'}`}>
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <h2 className="font-semibold text-lg">ProdCoach</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100'
                  : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200'
              }`}>
                {msg.agent_type && <div className="text-xs font-semibold uppercase text-zinc-400 mb-1">{msg.agent_type}</div>}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-zinc-500 animate-pulse">Les agents réfléchissent...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <button onClick={async () => {
            setLoading(true);
            const res = await fetch(`/api/sessions/${sessionId}/generate`, { method: 'POST' });
            const data = await res.json();
            if (data.files) {
              setGeneratedFiles(data.files);
              setShowCode(true);
            }
            setLoading(false);
          }} disabled={loading} className="w-full mb-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl">
            Générer le code
          </button>
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Décrivez votre idée..." className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            <button onClick={handleSend} disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition">Envoyer</button>
          </div>
        </div>
      </div>
      {showCode && (
        <div className="flex-1 animate-fadeIn">
          <CodeViewer files={generatedFiles} />
        </div>
      )}
    </div>
  );
}
