'use client';
import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

interface GeneratedFile { file_path: string; content: string; }

export default function CodeViewer({ files }: { files: GeneratedFile[] }) {
  const [selectedFile, setSelectedFile] = useState(files[0]?.file_path || '');
  const [previewHtml, setPreviewHtml] = useState('');

  const currentFile = files.find(f => f.file_path === selectedFile) || files[0];
  const highlighted = useMemo(() => {
    if (!currentFile) return '';
    const lang = currentFile.file_path.endsWith('.tsx') || currentFile.file_path.endsWith('.ts') ? 'typescript' :
                 currentFile.file_path.endsWith('.css') ? 'css' : 'markup';
    return Prism.highlight(currentFile.content, Prism.languages[lang] || Prism.languages.markup, lang);
  }, [currentFile]);

  const openPreview = () => {
    const combined = files
      .filter(f => f.file_path.endsWith('.tsx') || f.file_path.endsWith('.jsx') || f.file_path.endsWith('.html'))
      .map(f => `<!-- ${f.file_path} -->\n${f.content}`)
      .join('\n\n');
    setPreviewHtml(combined);
  };

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100">
      {/* File tree */}
      <div className="w-1/5 border-r border-zinc-800 p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-3">Explorateur</h3>
        {files.map(f => (
          <div
            key={f.file_path}
            className={`text-xs p-1.5 rounded cursor-pointer hover:bg-zinc-800 transition ${f.file_path === selectedFile ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            onClick={() => setSelectedFile(f.file_path)}
          >
            📄 {f.file_path}
          </div>
        ))}
      </div>

      {/* Code panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm text-zinc-400">{currentFile?.file_path}</span>
          <button onClick={openPreview} className="px-3 py-1 bg-blue-600 rounded-lg text-xs hover:bg-blue-500 transition">▶ Preview</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-900">
          <pre className="text-sm"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
        </div>
      </div>

      {/* Preview panel */}
      {previewHtml && (
        <div className="w-2/5 border-l border-zinc-800 p-3">
          <h3 className="text-xs font-semibold uppercase text-zinc-500 mb-3">Aperçu</h3>
          <iframe sandbox="allow-scripts allow-same-origin" srcDoc={previewHtml} className="w-full h-full rounded-lg border border-zinc-700" />
        </div>
      )}
    </div>
  );
}
