'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const router = useRouter();
  const userId = useAnonymousUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const loadSessions = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setSessions(data);
    };
    loadSessions();
  }, [userId]);

  const createNewSession = async () => {
    setLoading(true);
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initial_message: 'Bonjour, je veux coacher mon idée.',
        anonymous_user_id: userId,
      }),
    });
    const data = await res.json();
    if (data.session) {
      router.push(`/chat/${data.session.id}`);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-10 px-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">ProdCoach</h1>

      <button
        onClick={createNewSession}
        disabled={loading || !userId}
        className="mb-8 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Création...' : '➕ Nouveau coaching'}
      </button>

      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-xl font-semibold mb-4">Mes coachings</h2>
        {sessions.length === 0 && (
          <p className="text-gray-500">Aucun coaching pour le moment.</p>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="bg-white rounded shadow p-4">
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2"
              onClick={() => router.push(`/chat/${s.id}`)}
            >
              <div>
                <div className="font-medium">{s.title || 'Sans titre'}</div>
                <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{s.status}</span>
            </div>
            <button
              onClick={() => setSelectedSession(selectedSession === s.id ? null : s.id)}
              className="text-sm text-blue-600 mt-2 hover:underline"
            >
              {selectedSession === s.id ? 'Masquer le tableau de bord' : 'Voir le tableau de bord'}
            </button>
            {selectedSession === s.id && <Dashboard sessionId={s.id} />}
          </div>
        ))}
      </div>
    </main>
  );
}
