'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';

const phases = [
  { key: 'ideation', label: 'Idéation' },
  { key: 'etude_marche', label: 'Étude de marché' },
  { key: 'vision_valide', label: 'Vision produit validée' },
  { key: 'prd_valide', label: 'PRD validé' },
  { key: 'conception_mvp', label: 'Conception MVP' },
  { key: 'mvp_deploye', label: 'MVP déployé' },
  { key: 'utilisateurs_actifs', label: 'Utilisateurs actifs' },
  { key: 'visites_site', label: 'Visites sur le site' },
];

export default function Dashboard({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<any>(null);
  const userId = useAnonymousUser();

  useEffect(() => {
    if (!userId) return;
    const fetchSession = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      if (data) setSession(data);
    };
    fetchSession();
  }, [sessionId, userId]);

  const updatePhase = async (phase: string) => {
    await supabase.from('sessions').update({ phase }).eq('id', sessionId);
    setSession((prev: any) => ({ ...prev, phase }));
  };

  if (!session) return <div className="text-center text-gray-500">Chargement du projet...</div>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-3">🛠️ Avancement du projet</h2>
      <div className="space-y-2">
        {phases.map((p) => (
          <div
            key={p.key}
            className={`flex items-center p-2 rounded cursor-pointer ${
              session.phase === p.key
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50 border border-gray-200'
            }`}
            onClick={() => updatePhase(p.key)}
          >
            <span className={`w-4 h-4 rounded-full mr-2 ${session.phase === p.key ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
            <span className="text-sm">{p.label}</span>
            {session.phase === p.key && <span className="ml-auto text-xs text-blue-600 font-semibold">En cours</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">Cliquez sur une phase pour la marquer comme active.</p>
    </div>
  );
}
