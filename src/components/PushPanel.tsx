'use client';
import { useState } from 'react';

export default function PushPanel({ files }: { files: Record<string, string> }) {
  const [status, setStatus] = useState('Prêt. Sélectionnez une option ci-dessus.');
  const [loading, setLoading] = useState(false);

  const handlePush = async (platform: string) => {
    setLoading(true);
    setStatus(`⏳ Déploiement sur ${platform}...`);
    setTimeout(() => {
      setLoading(false);
      setStatus(`✅ Déployé sur ${platform} : https://mon-app.${platform.toLowerCase().replace(' ', '')}.com`);
    }, 1600);
  };

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-3"><i className="fas fa-rocket text-[var(--accent)]"></i> Push & Déploiement</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Poussez votre code sur GitHub ou déployez-le sur une plateforme cloud.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        {[
          { name: 'GitHub', icon: 'fab fa-github', color: '#fff', action: 'Pousser' },
          { name: 'Netlify', icon: 'fas fa-globe', color: '#00c7b7', action: 'Déployer' },
          { name: 'Vercel', icon: 'fas fa-rocket', color: '#000', action: 'Déployer' },
          { name: 'Cloudflare Pages', icon: 'fas fa-cloud', color: '#f38020', action: 'Déployer' },
        ].map(p => (
          <div key={p.name} className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-2xl p-5 transition hover:border-[var(--border-medium)]">
            <div className="text-2xl mb-2" style={{ color: p.color }}><i className={p.icon}></i></div>
            <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">Déployez votre site instantanément.</p>
            <button onClick={() => handlePush(p.name)} disabled={loading} className="px-3 py-1 rounded text-xs font-semibold border border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition disabled:opacity-50">{p.action}</button>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl flex items-center gap-3 text-sm text-[var(--text-secondary)] max-w-3xl">
        {loading && <div className="w-4 h-4 border-2 border-[var(--border-soft)] border-t-[var(--accent)] rounded-full animate-spin"></div>}
        {!loading && <i className="fas fa-info-circle text-[var(--accent)]"></i>}
        {status}
      </div>
    </div>
  );
}
