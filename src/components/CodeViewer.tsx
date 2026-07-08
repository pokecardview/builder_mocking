'use client';
import { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

interface GeneratedFile { file_path: string; content: string; }

export default function CodeViewer({ files }: { files: GeneratedFile[] }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(files[0]?.file_path || null);
  const [preview, setPreview] = useState<string>('');

  const currentFile = files.find(f => f.file_path === selectedFile) || files[0];
  const highlightedCode = currentFile ? Prism.highlight(currentFile.content, Prism.languages.javascript, 'javascript') : '';

  const renderPreview = () => {
    // Combine tout le code dans un iframe sandboxé
    const html = files.filter(f => f.file_path.endsWith('.html') || f.file_path.endsWith('.tsx') || f.file_path.endsWith('.jsx')).map(f => f.content).join('\n');
    setPreview(html);
  };

  return (
    <div className="flex h-full border rounded bg-white">
      <div className="w-1/4 border-r overflow-y-auto p-2">
        <h3 className="font-bold mb-2 text-sm">📁 Fichiers</h3>
        {files.map(f => (
          <div key={f.file_path}
               className={`text-sm p-1 cursor-pointer hover:bg-gray-100 ${f.file_path === selectedFile ? 'bg-blue-100' : ''}`}
               onClick={() => setSelectedFile(f.file_path)}>
            {f.file_path}
          </div>
        ))}
      </div>
      <div className="w-1/2 p-2 overflow-y-auto">
        <div className="flex justify-between mb-2">
          <h3 className="font-bold text-sm">💻 Code</h3>
          <button onClick={renderPreview} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">▶ Preview</button>
        </div>
        <pre className="text-xs overflow-x-auto"><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
      </div>
      <div className="w-1/4 border-l p-2">
        <h3 className="font-bold text-sm mb-2">🖥️ Preview</h3>
        {preview ? (
          <iframe sandbox="allow-scripts allow-same-origin" srcDoc={preview} className="w-full h-64 border" />
        ) : (
          <p className="text-xs text-gray-400">Cliquez sur "Preview" pour voir le rendu.</p>
        )}
      </div>
    </div>
  );
}
