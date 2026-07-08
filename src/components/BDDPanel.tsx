'use client';
import { useState } from 'react';

export default function BDDPanel() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('En attente de connexion à Supabase.');

  const handleConnect = () => {
    if (!url || !key) return setMessage('Veuillez remplir tous les champs.');
    setMessage('⏳ Connexion en cours...');
    setTimeout(() => {
      setConnected(true);
      setMessage('✅ Connecté à Supabase ! Tables : users, products, orders');
    }, 1200);
  };

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <i className="fas fa-database text-[var(--accent)]"></i> Base de données — Supabase
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Connectez votre projet Supabase pour intégrer la BDD à votre produit.</p>
      </div>
      <div className="grid grid-cols-2 gap-5 max-w-3xl">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-2xl p-6 transition hover:border-[var(--border-medium)]">
          <div className="text-3xl mb-3"><i className="fas fa-plug text-[var(--accent)]"></i></div>
          <h3 className="font-semibold mb-1">Connexion Supabase</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Renseignez les identifiants de votre projet.</p>
          <div className="mb-3">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">URL du projet</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://votre-projet.supabase.co" className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-soft)] rounded-md text-sm text-white outline-none focus:border-[var(--accent)]" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Clé anon (public)</label>
            <input value={key} onChange={e => setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." type="password" className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-soft)] rounded-md text-sm text-white outline-none focus:border-[var(--accent)]" />
          </div>
          <button onClick={handleConnect} className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--purple)] text-white">Connecter</button>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-2xl p-6 transition hover:border-[var(--border-medium)]">
          <div className="text-3xl mb-3"><i className="fas fa-table text-[var(--green)]"></i></div>
          <h3 className="font-semibold mb-1">Tables & données</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Une fois connecté, vos tables apparaîtront ici.</p>
          <div className="text-xs text-[var(--text-tertiary)] space-y-1">
            <div className="flex justify-between border-b border-[var(--border-soft)] pb-1"><span>📊 <strong>users</strong></span><span>3 colonnes</span></div>
            <div className="flex justify-between border-b border-[var(--border-soft)] pb-1"><span>📊 <strong>products</strong></span><span>5 colonnes</span></div>
            <div className="flex justify-between"><span>📊 <strong>orders</strong></span><span>4 colonnes</span></div>
          </div>
        </div>
      </div>
      <div className={`mt-6 p-4 bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl flex items-center gap-3 text-sm text-[var(--text-secondary)] max-w-3xl ${connected ? 'border-[var(--green)]' : ''}`}>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--green)]' : 'bg-[var(--orange)]'}`}></span>
        {message}
      </div>
    </div>
  );
}
