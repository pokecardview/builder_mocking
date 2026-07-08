'use client';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const router = useRouter();

  return (
    <div className="flex items-center px-6 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-soft)] flex-shrink-0 gap-4 backdrop-blur-md">
      <div className="flex gap-1 flex-1 overflow-x-auto">
        {['code','preview','architecture','bdd','push','readme'].map(tab => (
          <button
            key={tab}
            onClick={() => router.push('/?tab=' + tab)}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all whitespace-nowrap"
          >
            <i className={`fas fa-${tab === 'code' ? 'code' : tab === 'preview' ? 'eye' : tab === 'architecture' ? 'sitemap' : tab === 'bdd' ? 'database' : tab === 'push' ? 'rocket' : 'book'} mr-1.5`}></i>
            {tab === 'code' ? 'Code' : tab === 'preview' ? 'Preview' : tab === 'architecture' ? 'Architecture' : tab === 'bdd' ? 'BDD' : tab === 'push' ? 'Push' : 'README'}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border-soft)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-white transition">
          <i className="fas fa-download mr-1.5"></i>Export
        </button>
        <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--purple)] text-white hover:scale-105 transition shadow-lg">
          <i className="fas fa-play mr-1.5"></i>Run
        </button>
      </div>
    </div>
  );
}
