'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [tokens, setTokens] = useState({
    github: '',
    supabase: '',
    netlify: '',
    vercel: '',
    cloudflare: '',
    cloudflareAccountId: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadTokens = async () => {
      const { data } = await supabase.from('user_tokens').select('*').single();
      if (data) {
        setTokens({
          github: data.github_token || '',
          supabase: data.supabase_management_token || '',
          netlify: data.netlify_access_token || '',
          vercel: data.vercel_access_token || '',
          cloudflare: data.cloudflare_api_token || '',
          cloudflareAccountId: data.cloudflare_account_id || '',
        });
      }
    };
    loadTokens();
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/user/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
    if (res.ok) setMessage('✅ Tokens sauvegardés.');
    else setMessage('❌ Erreur lors de la sauvegarde.');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Paramètres de déploiement</h1>
      <input type="password" placeholder="Token GitHub" value={tokens.github} onChange={e => setTokens({...tokens, github: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Supabase Management" value={tokens.supabase} onChange={e => setTokens({...tokens, supabase: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Netlify" value={tokens.netlify} onChange={e => setTokens({...tokens, netlify: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Vercel" value={tokens.vercel} onChange={e => setTokens({...tokens, vercel: e.target.value})} className="w-full p-2 border" />
      <input type="password" placeholder="Token Cloudflare" value={tokens.cloudflare} onChange={e => setTokens({...tokens, cloudflare: e.target.value})} className="w-full p-2 border" />
      <input type="text" placeholder="Cloudflare Account ID" value={tokens.cloudflareAccountId} onChange={e => setTokens({...tokens, cloudflareAccountId: e.target.value})} className="w-full p-2 border" />
      <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">Sauvegarder</button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
