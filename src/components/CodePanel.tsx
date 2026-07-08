'use client';
import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

interface CodePanelProps {
  files: Record<string, string>;
  currentFile: string;
  onFileChange: (file: string) => void;
  onFilesUpdate: (files: Record<string, string>) => void;
}

export default function CodePanel({ files, currentFile, onFileChange }: CodePanelProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current);
  }, [currentFile, files]);

  const content = files[currentFile] || '// Fichier non trouvé';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 h-9 bg-[var(--bg-elevated)] border-b border-[var(--border-soft)] gap-1 flex-shrink-0">
        {Object.keys(files).map(name => (
          <button
            key={name}
            onClick={() => onFileChange(name)}
            className={`px-3 py-1 text-xs rounded-md font-mono transition ${
              currentFile === name ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            📄 {name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4 bg-[var(--bg-base)]">
        <pre className="!bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-lg p-5 font-mono text-sm leading-relaxed">
          <code ref={codeRef} className="language-javascript">{content}</code>
        </pre>
      </div>
    </div>
  );
}
