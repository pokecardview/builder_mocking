'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Envoi du lien magique...');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/chat` },
    });
    if (error) setMessage(`Erreur: ${error.message}`);
    else setMessage('✅ Vérifiez votre email pour le lien de connexion.');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Connexion par Magic Link</button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
