'use client';
import { useState } from 'react';
import CodePanel from './CodePanel';
import PreviewPanel from './PreviewPanel';
import ArchitecturePanel from './ArchitecturePanel';
import BDDPanel from './BDDPanel';
import PushPanel from './PushPanel';
import ReadmePanel from './ReadmePanel';

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('code');
  const [files, setFiles] = useState<Record<string, string>>({
    'app.js': `// ─── Application ───\nconsole.log('🚀 App démarrée');`,
    'index.html': `<!DOCTYPE html>\n<html>\n<head><title>App</title></head>\n<body><h1>Hello</h1></body>\n</html>`,
    'style.css': `body { font-family: system-ui; background: #f0f4ff; }`
  });
  const [currentFile, setCurrentFile] = useState('app.js');

  const renderPanel = () => {
    switch (activeTab) {
      case 'code':
        return <CodePanel files={files} currentFile={currentFile} onFileChange={setCurrentFile} onFilesUpdate={setFiles} />;
      case 'preview':
        return <PreviewPanel files={files} />;
      case 'architecture':
        return <ArchitecturePanel files={files} />;
      case 'bdd':
        return <BDDPanel />;
      case 'push':
        return <PushPanel files={files} />;
      case 'readme':
        return <ReadmePanel />;
      default:
        return <CodePanel files={files} currentFile={currentFile} onFileChange={setCurrentFile} onFilesUpdate={setFiles} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center px-4 h-10 bg-[var(--bg-surface)] border-b border-[var(--border-soft)] gap-1 flex-shrink-0">
        {['code','preview','architecture','bdd','push','readme'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === tab ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <i className={`fas fa-${tab === 'code' ? 'code' : tab === 'preview' ? 'eye' : tab === 'architecture' ? 'sitemap' : tab === 'bdd' ? 'database' : tab === 'push' ? 'rocket' : 'book'} mr-1`}></i>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>
    </div>
  );
}
