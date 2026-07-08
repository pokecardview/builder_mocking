'use client';
import { useMemo } from 'react';

interface PreviewPanelProps {
  files: Record<string, string>;
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const html = files['index.html'] || '<html><body><p>No index.html</p></body></html>';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 h-9 bg-[var(--bg-elevated)] border-b border-[var(--border-soft)] text-xs text-[var(--text-tertiary)] flex-shrink-0">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></span> Aperçu en direct</span>
      </div>
      <iframe className="flex-1 border-none bg-white" srcDoc={html} />
    </div>
  );
}
