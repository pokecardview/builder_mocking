'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAnonymousUser } from '@/hooks/useAnonymousUser';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const userId = useAnonymousUser();
  const [activeTab, setActiveTab] = useState('code');

  useEffect(() => {
    if (pathname?.includes('/chat')) setActiveTab('chat');
    else if (pathname?.includes('/settings')) setActiveTab('settings');
    else setActiveTab('code');
  }, [pathname]);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'chat') router.push('/chat/new');
    else if (tab === 'settings') router.push('/settings');
    else router.push('/?tab=' + tab);
  };

  return (
    <aside className="w-[280px] min-w-[280px] bg-[var(--bg-surface)] border-r border-[var(--border-soft)] flex flex-col flex-shrink-0 relative z-10">
      <div className="p-5 border-b border-[var(--border-soft)] flex items-center justify-between">
        <div className="flex items-center gap-3 font-extrabold text-xl tracking-tight">
          <i className="fas fa-cube text-2xl gradient-text"></i>
          <span className="gradient-text">Agentic</span>
        </div>
        <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-full border border-[var(--accent-soft)] font-semibold">v3.0</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold px-3 pb-2 opacity-50">Workspace</div>
          {['code','preview','architecture','bdd','push','readme'].map(tab => (
            <button
              key={tab}
              onClick={() => navigate(tab)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                activeTab === tab ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(109,140,255,0.08)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="w-7 text-center text-base"><i className={`fas fa-${tab === 'code' ? 'code' : tab === 'preview' ? 'eye' : tab === 'architecture' ? 'sitemap' : tab === 'bdd' ? 'database' : tab === 'push' ? 'rocket' : 'book'}`}></i></span>
              {tab === 'code' ? 'Code' : tab === 'preview' ? 'Preview' : tab === 'architecture' ? 'Architecture' : tab === 'bdd' ? 'BDD' : tab === 'push' ? 'Push' : 'README'}
              {tab === 'preview' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--green-glow)] text-[var(--green)] border border-[var(--green-glow)]">live</span>}
              {tab === 'bdd' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">Supabase</span>}
              {tab === 'push' && <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">deploy</span>}
            </button>
          ))}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold px-3 pb-2 opacity-50">Agents</div>
          <button onClick={() => navigate('chat')} className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all mb-0.5">
            <span className="w-7 text-center text-base"><i className="fas fa-comment-dots"></i></span>
            Chat Agent
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--green-glow)] text-[var(--green)]">●</span>
          </button>
          <button className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all">
            <span className="w-7 text-center text-base"><i className="fas fa-play-circle"></i></span>
            Run Pipeline
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--border-soft)]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-soft)]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--purple)] flex items-center justify-center text-sm font-bold text-white">P</div>
          <div className="flex-1">
            <div className="text-xs font-semibold">Product Team</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">AI Orchestrator</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
}
