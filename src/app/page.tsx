'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';

export default function HomePage() {
  const router = useRouter();
  const userId = useAnonymousUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setSessions(data);
    });
  }, [userId]);

  const createNewSession = async () => {
    setLoading(true);
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initial_message: 'Bonjour, je veux coacher mon idée.', anonymous_user_id: userId }),
    });
    const data = await res.json();
    if (data.session) router.push(`/chat/${data.session.id}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-6">
      {/* Hero */}
      <div className="text-center max-w-3xl animate-fadeIn">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          ProdCoach
        </h1>
        <p className="mt-4 text-xl text-zinc-400">
          Coach IA · Challenge · Génération · Déploiement
        </p>
        <p className="mt-2 text-zinc-500">Transformez une idée brute en application déployée, sans friction.</p>

        <button
          onClick={createNewSession}
          disabled={loading || !userId}
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">Création...</span>
          ) : (
            <>
              <span>➕ Nouveau coaching</span>
            </>
          )}
        </button>
      </div>

      {/* Liste des coachings précédents */}
      {sessions.length > 0 && (
        <div className="mt-16 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-zinc-200">Mes coachings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => router.push(`/chat/${s.id}`)}
                className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50 transition-all backdrop-blur-sm"
              >
                <div className="font-medium text-zinc-200">{s.title || 'Sans titre'}</div>
                <div className="text-sm text-zinc-500 mt-1">{new Date(s.created_at).toLocaleString()}</div>
                <div className="mt-2 text-xs inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
